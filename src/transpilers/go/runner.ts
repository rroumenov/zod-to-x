import Case from "case";

import {
    ASTAliasedTypes,
    ASTArray,
    ASTDefinition,
    ASTEnum,
    ASTIntersection,
    ASTNode,
    ASTObject,
    ASTUnion,
    Zod2X,
} from "@/core";
import { INT32_RANGES } from "@/utils/number_limits";

import { getLibs } from "./libs";
import { defaultOpts, IZod2GoOpt } from "./options";

/**
 * Transpiler for Zod schemas to Go structs and types.
 */
export class Zod2Go extends Zod2X<IZod2GoOpt> {
    protected readonly commentKey = "//";

    protected lib;

    constructor(opt: IZod2GoOpt = {}) {
        super({ ...defaultOpts, ...opt });
        this.lib = getLibs();
    }

    protected runBefore(): void {
        this.preImports.add(`package ${this.opt.packageName ?? "models"}`);
    }

    protected runAfter(): void {
        this._consolidateImports();
    }

    /**
     * Consolidates all collected imports into a proper Go import block.
     * Single import → `import "pkg"`, multiple → `import (\n\t"pkg"\n)`.
     */
    private _consolidateImports(): void {
        if (this.imports.size === 0) return;

        const sorted = Array.from(this.imports).sort();
        let block: string;

        if (sorted.length === 1) {
            block = `import ${sorted[0]}`;
        } else {
            block = `import (\n${sorted.map((s) => `\t${s}`).join("\n")}\n)`;
        }

        // Replace the individual entries with the consolidated block
        this.imports.clear();
        this.imports.add(block);
    }

    protected addImportFromFile(filename: string, namespace: string): string {
        const base = filename.endsWith(".go") ? filename.slice(0, -3) : filename;
        return `${namespace} "./${base}"`;
    }

    protected getTypeFromExternalNamespace(namespace: string, typeName: string): string {
        return `${namespace}.${typeName}`;
    }

    protected addExtendedType(
        name: string,
        parentNamespace: string,
        aliasOf: string,
        opt?: {
            type?: "union" | "alias";
            isInternal?: boolean;
            templates?: string;
            declaredTemplates?: string;
        }
    ): void {
        const extendedType = opt?.isInternal
            ? aliasOf
            : this.getTypeFromExternalNamespace(parentNamespace, aliasOf);

        const templates = opt?.templates ?? "";
        const declaredTemplates = opt?.declaredTemplates ?? "";

        if (opt?.type === "alias" || opt?.type === "union") {
            this.push0(`type ${name}${declaredTemplates} = ${extendedType}${templates}\n`);
        } else {
            // Struct embedding: type ChildName struct { ParentType }
            this.push0(`type ${name}${declaredTemplates} struct {`);
            this.push1(`${extendedType}${templates}`);
            this.push0(`}\n`);
        }
    }

    protected getGenericTemplatesTranslation(data: ASTNode): string | undefined {
        if (
            (data instanceof ASTObject || data instanceof ASTDefinition) &&
            data.templatesTranslation.length > 0
        ) {
            return (
                "[" +
                data.templatesTranslation
                    .map((t) => {
                        if (this.isExternalTypeImport(t)) {
                            this.addExternalTypeImport(t);
                            return this.getTypeFromExternalNamespace(
                                t.parentNamespace!,
                                t.aliasOf!
                            );
                        } else {
                            return t.aliasOf!;
                        }
                    })
                    .join(", ") +
                "]"
            );
        }
    }

    /**
     * Emits an alias/extension declaration early when a node references another layered type.
     */
    protected checkExtendedTypeInclusion(data: ASTNode, type?: "union" | "alias"): boolean {
        const isStruct =
            data instanceof ASTObject ||
            (data instanceof ASTIntersection && data.newObject !== undefined);

        const translatedTemplates = this.getGenericTemplatesTranslation(data);
        const templates = translatedTemplates || undefined;

        // For declared-template fallback on the declared (definition) side
        const declaredTemplates =
            !translatedTemplates && data instanceof ASTObject && data.templates.size > 0
                ? `[${[...data.templates].map((t) => `${t} any`).join(", ")}]`
                : undefined;

        if (this.isExternalTypeImport(data)) {
            if (data.aliasOf) {
                this.addExtendedType(data.name!, data.parentNamespace!, data.aliasOf!, {
                    type: isStruct ? undefined : type,
                    templates,
                    declaredTemplates,
                });
                this.addExternalTypeImport(data);
            }
            return true;
        } else if (data.aliasOf) {
            this.addExtendedType(data.name!, data.parentNamespace!, data.aliasOf, {
                type: isStruct ? undefined : type,
                isInternal: true,
                templates,
                declaredTemplates,
            });
            return true;
        }
        return false;
    }

    // ── Primitive type methods ──────────────────────────────────────────────

    protected getStringType = (): string => "string";
    protected getBooleanType = (): string => "bool";
    protected getAnyType = (): string => "any";

    protected getDateType = (): string => {
        this.imports.add(this.lib.timePackage);
        return "time.Time";
    };

    protected getNumberType = (isInt: boolean, range: { min?: number; max?: number }): string => {
        if (!isInt) return "float64";

        const min = range.min;
        const max = range.max;

        if (
            min !== undefined &&
            max !== undefined &&
            min >= INT32_RANGES[0] &&
            max <= INT32_RANGES[1]
        ) {
            return "int32";
        }

        return "int64";
    };

    protected getLiteralStringType(
        value: string | number | boolean,
        parentEnumNameKey?: [string, string]
    ): string | number {
        if (parentEnumNameKey) {
            // Go constants cannot be used as types; use the parent enum type name
            return parentEnumNameKey[0];
        }

        // Go has no literal types; return the underlying primitive type
        if (typeof value === "boolean") return "bool";
        if (typeof value === "number")
            return isNaN(value) ? "float64" : Number.isInteger(value) ? "int64" : "float64";
        return "string";
    }

    // ── Composite type methods ──────────────────────────────────────────────

    /** Ex: []TypeA, [][]TypeA */
    protected getArrayType(arrayType: string, arrayDeep: number): string {
        let output = `[]${arrayType}`;
        for (let i = 0; i < arrayDeep - 1; i++) {
            output = `[]${output}`;
        }
        return output;
    }

    /** Ex: map[TypeA]struct{} */
    protected getSetType = (itemType: string): string => `map[${itemType}]struct{}`;

    /** Ex: map[KeyType]ValueType */
    protected getMapType = (keyType: string, valueType: string): string =>
        `map[${keyType}]${valueType}`;

    /** Ex: map[KeyType]ValueType */
    protected getRecordType = (keyType: string, valueType: string): string =>
        `map[${keyType}]${valueType}`;

    /** Go has no native tuple; use []any */
    protected getTupleType = (_itemsType: string[]): string => "[]any";

    /** Go has no native union; use any */
    protected getUnionType = (_itemsType: string[]): string => "any";

    /** Handled entirely in transpileIntersection via struct embedding */
    protected getIntersectionType = (): string => "";

    // ── Transpile methods ───────────────────────────────────────────────────

    protected transpileAliasedType(data: ASTAliasedTypes): void {
        if (this.checkExtendedTypeInclusion(data, "alias")) {
            return;
        }

        this.addComment(data.description);

        let extendedType: string;
        if (data instanceof ASTArray) {
            extendedType = this.getAttributeType(data.item);
        } else {
            extendedType = this.getAttributeType(data);
        }

        this.push0(`type ${data.name} = ${extendedType}\n`);
    }

    /**
     * Emit a Go enum using a typed string or int alias + const block.
     *
     * All-string values:
     *   type EnumItem string
     *   const (
     *       EnumItemEnum1 EnumItem = "Enum1"
     *   )
     *
     * All-int values:
     *   type EnumItem int
     *   const (
     *       EnumItemNativeEnum1 EnumItem = 1
     *   )
     *
     * Mixed (int + string): untyped constants with warning comment.
     */
    protected transpileEnum(data: ASTEnum): void {
        if (this.checkExtendedTypeInclusion(data, "alias")) {
            return;
        }

        this.addComment(data.description);

        const allStrings = data.values.every(([, v]) => typeof v === "string");
        const allInts = data.values.every(([, v]) => typeof v === "number");

        if (allStrings) {
            this.push0(`type ${data.name} string\n`);
            this.push0(`const (`);
            data.values.forEach(([key, value]) => {
                const constName = `${data.name}${Case.pascal(key)}`;
                this.push1(`${constName} ${data.name} = "${value}"`);
            });
            this.push0(`)\n`);
        } else if (allInts) {
            this.push0(`type ${data.name} int\n`);
            this.push0(`const (`);
            data.values.forEach(([key, value]) => {
                const constName = `${data.name}${Case.pascal(key)}`;
                this.push1(`${constName} ${data.name} = ${value}`);
            });
            this.push0(`)\n`);
        } else {
            // Mixed types — Go cannot express this as a single typed enum.
            // Declare as `any` so struct fields can reference the type name.
            this.push0(`type ${data.name} = any\n`);
            this.output.push(`// ${data.name}: mixed-type enum — no single Go base type available`);
            this.push0(`const (`);
            data.values.forEach(([key, value]) => {
                const constName = `${data.name}${Case.pascal(key)}`;
                const v = typeof value === "string" ? `"${value}"` : `${value}`;
                this.push1(`${constName} = ${v}`);
            });
            this.push0(`)\n`);
        }
    }

    /**
     * Go union: emit `type Name any` with a comment listing possible types.
     *
     * For discriminated unions: emit a marker interface + marker stubs on each
     * member type + an `UnmarshalXxx` helper that dispatches on the discriminant
     * key using a `json.RawMessage` probe (uniform for string, bool, and number
     * discriminant values).
     */
    protected transpileUnion(data: ASTUnion): void {
        if (this.checkExtendedTypeInclusion(data, "union")) {
            return;
        }

        this.addComment(data.description);

        const optionNames = data.options.map(this.getAttributeType.bind(this));

        if (data.discriminantKey) {
            const methodName = `is${data.name}`;
            this.push0(`// ${data.name} is a discriminated union on "${data.discriminantKey}".`);
            this.push0(`// Possible types: ${optionNames.join(", ")}`);
            this.push0(`type ${data.name} interface {`);
            this.push1(`${methodName}()`);
            this.push0(`}\n`);

            // Marker stubs: one no-op method per member type so each satisfies the interface.
            // For generic instantiations (e.g. "HttpSuccessfulResponse[SomeDtoResult]") we emit
            // a generic receiver "func (t Base[T]) isXxx() {}" using the base type name only.
            for (const name of optionNames) {
                const bracketIdx = name.indexOf("[");
                const receiver = bracketIdx !== -1 ? `${name.slice(0, bracketIdx)}[T]` : name;
                this.push0(`func (t ${receiver}) ${methodName}() {}\n`);
            }

            // UnmarshalXxx helper — only when every member has a discriminant value in the AST.
            const optionsData = data.options.map((opt, i) => ({
                typeName: optionNames[i],
                discriminantValue: (opt as ASTDefinition).constraints?.discriminantValue as
                    | string
                    | undefined,
            }));

            const allHaveDiscriminantValue = optionsData.every(
                (o) => o.discriminantValue !== undefined
            );

            if (allHaveDiscriminantValue) {
                this.imports.add(this.lib.jsonPackage);
                this.imports.add(this.lib.fmtPackage);

                const probeField =
                    data.discriminantKey.charAt(0).toUpperCase() + data.discriminantKey.slice(1);

                this.push0(
                    `// Unmarshal${data.name} deserializes JSON into the correct ${data.name} concrete type`
                );
                this.push0(`// by probing the "${data.discriminantKey}" discriminant field.`);
                this.push0(`func Unmarshal${data.name}(data []byte) (${data.name}, error) {`);
                this.push1(`var probe struct {`);
                this.push2(`${probeField} json.RawMessage \`json:"${data.discriminantKey}"\``);
                this.push1(`}`);
                this.push1(`if err := json.Unmarshal(data, &probe); err != nil {`);
                this.push2(`return nil, err`);
                this.push1(`}`);
                this.push1(`switch string(probe.${probeField}) {`);
                for (const opt of optionsData) {
                    const dv = opt.discriminantValue!;
                    // Determine raw JSON representation of the case value.
                    // String literals appear in JSON with surrounding quotes ("Enum1" → "Enum1").
                    // Bool and number literals appear without quotes (true → true, 42 → 42).
                    const isStringLiteral = isNaN(Number(dv)) && dv !== "true" && dv !== "false";
                    const caseVal = isStringLiteral ? `\`"${dv}"\`` : `"${dv}"`;
                    this.push1(`case ${caseVal}:`);
                    this.push2(`var v ${opt.typeName}`);
                    this.push2(`if err := json.Unmarshal(data, &v); err != nil {`);
                    this.push3(`return nil, err`);
                    this.push2(`}`);
                    this.push2(`return v, nil`);
                }
                this.push1(`}`);
                this.push1(
                    `return nil, fmt.Errorf("failed to deserialize ${data.name}: unknown discriminator %s", string(probe.${probeField}))`
                );
                this.push0(`}\n`);
            }
        } else {
            this.push0(`// ${data.name} is a union of: ${optionNames.join(", ")}`);
            this.push0(`type ${data.name} = any\n`);
        }
    }

    /**
     * Go intersection: struct embedding.
     *
     * type IntersectionItem struct {
     *     ObjectItem
     *     OtherObjectItem
     * }
     */
    protected transpileIntersection(data: ASTIntersection): void {
        if (this.checkExtendedTypeInclusion(data)) {
            return;
        }

        this.addComment(data.description);

        if (data.newObject) {
            // Flatten the merged object into a plain struct
            this._transpileStructBody(data.newObject);
        } else {
            // Embed both sides
            const leftType = this.getAttributeType(data.left);
            const rightType = this.getAttributeType(data.right);
            this.push0(`type ${data.name} struct {`);
            this.push1(leftType);
            this.push1(rightType);
            this.push0(`}\n`);
        }
    }

    protected transpileStruct(data: ASTObject): void {
        if (this.checkExtendedTypeInclusion(data)) {
            return;
        }

        this.addComment(data.description);
        this._transpileStructBody(data);
    }

    /** Render a Go struct body for an ASTObject. */
    private _transpileStructBody(data: ASTObject): void {
        const templateParams =
            data.templates.size > 0
                ? `[${[...data.templates].map((t) => `${t} any`).join(", ")}]`
                : "";

        this.push0(`type ${data.name}${templateParams} struct {`);

        const hasProperties = Object.keys(data.properties).length > 0;

        if (!hasProperties) {
            this.push0(`}\n`);
            return;
        }

        for (const [key, value] of Object.entries(data.properties)) {
            const fieldName = this.opt.keepKeys === true ? key : Case.pascal(key);
            this._transpileMember(fieldName, key, value);
        }

        this.push0(`}\n`);
    }

    /** Render a single struct field: `FieldName Type \`json:"key"\`` */
    private _transpileMember(fieldName: string, originalKey: string, memberNode: ASTNode): void {
        const isOptionalOrNullable = memberNode.isOptional || memberNode.isNullable;

        let varType = this.getAttributeType(memberNode);

        // Optional/nullable fields use pointer types
        if (isOptionalOrNullable) {
            // Avoid double-pointer for types already expressed as pointers/interfaces
            if (!varType.startsWith("*") && varType !== "any") {
                varType = `*${varType}`;
            }
        }

        if (memberNode.description && !memberNode.name && !this.isTranspilerable(memberNode)) {
            this.addComment(memberNode.description, `\n${this.indent[1]}`);
        }

        const tag = this._buildJsonTag(originalKey, isOptionalOrNullable ?? false);
        this.push1(`${fieldName} ${varType}${tag}`);
    }

    private _buildJsonTag(originalKey: string, omitempty: boolean): string {
        if (this.opt.useJsonTags === false) return "";
        const flags = omitempty ? `,omitempty` : "";
        return ` \`json:"${originalKey}${flags}"\``;
    }
}
