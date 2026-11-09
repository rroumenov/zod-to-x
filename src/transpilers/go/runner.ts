import Case from "case";

import {
    ASTAliasedTypes,
    ASTArray,
    ASTDefinition,
    ASTEnum,
    ASTIntersection,
    ASTMap,
    ASTNode,
    ASTNodes,
    ASTObject,
    ASTUnion,
    TExtendedTypeKind,
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

    /**
     * Unions of the transpiled file and of the files it imports, by node key.
     */
    private _unions = new Map<string, ASTUnion>();

    constructor(opt: IZod2GoOpt = {}) {
        super({ ...defaultOpts, ...opt });
        this.lib = getLibs();
    }

    transpile(transpilerQueue: ASTNodes): string {
        this._unions.clear();
        transpilerQueue.nodes.forEach((node, key) => {
            if (node instanceof ASTUnion) {
                this._unions.set(key, node);
            }
        });

        return super.transpile(transpilerQueue);
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

    protected readonly genericTemplatesBrackets: [string, string] = ["[", "]"];

    /**
     * For Layered Modeling. Language options used to declare a type that extends another one.
     */
    protected getExtendedTypeOptions(data: ASTNode, type?: TExtendedTypeKind) {
        const isStruct =
            data instanceof ASTObject ||
            (data instanceof ASTIntersection && data.newObject !== undefined);

        const translatedTemplates = this.getGenericTemplatesTranslation(data);

        return {
            type: isStruct ? undefined : (type as "union" | "alias" | undefined),
            templates: translatedTemplates || undefined,
            // For declared-template fallback on the declared (definition) side
            declaredTemplates:
                !translatedTemplates && data instanceof ASTObject && data.templates.size > 0
                    ? `[${[...data.templates].map((t) => `${t} any`).join(", ")}]`
                    : undefined,
        };
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

            // Methods cannot be declared on types of other packages, so their variants are
            // wrapped in local types that embed them: their fields and their JSON are the same.
            const variantTypes = data.options.map((opt, i) => {
                if (!opt.parentFile) {
                    return optionNames[i];
                }
                const discriminantValue = (opt as ASTDefinition).constraints?.discriminantValue;
                const baseName = optionNames[i].replace(/\[.*$/, "").split(".").pop()!;
                return `${data.name}${Case.pascal(String(discriminantValue ?? baseName))}`;
            });

            this.push0(`// ${data.name} is a discriminated union on "${data.discriminantKey}".`);
            this.push0(`// Possible types: ${variantTypes.join(", ")}`);
            this.push0(`type ${data.name} interface {`);
            this.push1(`${methodName}()`);
            this.push0(`}\n`);

            data.options.forEach((opt, i) => {
                if (opt.parentFile) {
                    this.push0(
                        `// ${variantTypes[i]} is the ${data.name} variant of ${optionNames[i]}.`
                    );
                    this.push0(`type ${variantTypes[i]} struct {`);
                    this.push1(optionNames[i]);
                    this.push0(`}\n`);
                }
            });

            // Marker stubs: one no-op method per member type so each satisfies the interface.
            // For generic instantiations (e.g. "HttpSuccessfulResponse[SomeDtoResult]") we emit
            // a generic receiver "func (t Base[T]) isXxx() {}" using the base type name only, with
            // one type parameter per template, once for all the instances of the generic type.
            const receivers = new Set<string>();
            variantTypes.forEach((name, i) => {
                const bracketIdx = name.indexOf("[");
                if (bracketIdx === -1) {
                    receivers.add(name);
                    return;
                }
                const count = (data.options[i] as ASTDefinition).templatesTranslation.length;
                const params =
                    count > 1
                        ? Array.from({ length: count }, (_, j) => `T${j + 1}`).join(", ")
                        : "T";
                receivers.add(`${name.slice(0, bracketIdx)}[${params}]`);
            });
            for (const receiver of receivers) {
                this.push0(`func (t ${receiver}) ${methodName}() {}\n`);
            }

            // UnmarshalXxx helper — only when every member has a discriminant value in the AST.
            const optionsData = data.options.map((opt, i) => ({
                typeName: variantTypes[i],
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

        this._transpileUnionFieldsUnmarshal(data);
    }

    /**
     * Returns the function that deserializes a discriminated union (`UnmarshalXxx`), if any.
     */
    private _getUnionUnmarshal(node: ASTNode): string | undefined {
        if (!(node instanceof ASTDefinition) || node.instanceType !== ASTUnion.kind) {
            return undefined;
        }

        const key =
            node.parentFile !== undefined && node.aliasOf === undefined
                ? `${node.parentFile}::${node.name}`
                : node.name;
        const union = this._unions.get(key);
        const hasUnmarshal =
            union?.discriminantKey !== undefined &&
            union.options.every(
                (opt) => (opt as ASTDefinition).constraints?.discriminantValue !== undefined
            );

        if (!hasUnmarshal) {
            return undefined;
        }

        // Layer aliases of unions are Go type aliases: the function of the original is used.
        const name = `Unmarshal${union.aliasOf ?? union.name}`;
        return this.isExternalTypeImport(union) && union.parentNamespace
            ? this.getTypeFromExternalNamespace(union.parentNamespace, name)
            : name;
    }

    /**
     * Returns how a field whose type is a discriminated union is deserialized, if it is one.
     */
    private _getUnionField(node: ASTNode):
        | {
              kind: "single" | "array" | "map";
              unmarshal: string;
              itemType: string;
              keyType?: string;
          }
        | undefined {
        const itemType = (item: ASTNode) =>
            this.getAttributeType(
                Object.assign(Object.create(item), { arrayDimension: undefined })
            );

        if (node instanceof ASTMap && !node.arrayDimension) {
            const unmarshal = node.value.arrayDimension
                ? undefined
                : this._getUnionUnmarshal(node.value);
            return unmarshal
                ? {
                      kind: "map",
                      unmarshal,
                      itemType: itemType(node.value),
                      keyType: this.getAttributeType(node.key),
                  }
                : undefined;
        }

        const unmarshal = this._getUnionUnmarshal(node);
        if (unmarshal === undefined || (node.arrayDimension ?? 0) > 1) {
            return undefined;
        }

        return {
            kind: node.arrayDimension ? "array" : "single",
            unmarshal,
            itemType: itemType(node),
        };
    }

    /**
     * Ex: for the fields `Event AnyEvent` and `History []AnyEvent`
     * func (s *EventLog) UnmarshalJSON(data []byte) error {
     *     type alias EventLog
     *     aux := struct {
     *         *alias
     *         Event json.RawMessage `json:"event"`
     *         History []json.RawMessage `json:"history"`
     *     }{alias: (*alias)(s)}
     *     ...
     * }
     *
     * encoding/json cannot deserialize interfaces, so the fields whose type is a discriminated
     * union are deserialized as raw JSON, and then by the function of the union. The alias type
     * deserializes the other fields without calling this method again.
     */
    private _transpileUnionFieldsUnmarshal(data: ASTObject): void {
        // Generic types cannot declare the local alias type in their methods.
        if (data.templates.size > 0 || this.opt.useJsonTags === false) {
            return;
        }

        const fields = Object.entries(data.properties)
            .map(([key, node]) => ({
                key,
                name: this.opt.keepKeys === true ? key : Case.pascal(key),
                isPointer: node.isOptional || node.isNullable,
                field: this._getUnionField(node),
            }))
            .filter((i) => i.field !== undefined);

        if (fields.length === 0) {
            return;
        }

        this.imports.add(this.lib.jsonPackage);

        const rawTypes = { single: "json.RawMessage", array: "[]json.RawMessage" };
        this.push0(
            `// UnmarshalJSON deserializes the fields of ${data.name} whose type is a discriminated union.`
        );
        this.push0(`func (s *${data.name}) UnmarshalJSON(data []byte) error {`);
        this.push1(`type alias ${data.name}`);
        this.push1(`aux := struct {`);
        this.push2(`*alias`);
        for (const { key, name, field } of fields) {
            const rawType =
                field!.kind === "map"
                    ? `map[${field!.keyType}]json.RawMessage`
                    : rawTypes[field!.kind];
            this.push2(`${name} ${rawType} \`json:"${key}"\``);
        }
        this.push1(`}{alias: (*alias)(s)}`);
        this.push1(`if err := json.Unmarshal(data, &aux); err != nil {`);
        this.push2(`return err`);
        this.push1(`}`);

        for (const { name, isPointer, field } of fields) {
            const { kind, unmarshal, itemType, keyType } = field!;
            const ref = isPointer ? "&" : "";

            if (kind === "single") {
                this.push1(`if len(aux.${name}) > 0 && string(aux.${name}) != "null" {`);
                this.push2(`v, err := ${unmarshal}(aux.${name})`);
                this.push2(`if err != nil {`);
                this.push3(`return err`);
                this.push2(`}`);
                this.push2(`s.${name} = ${ref}v`);
                this.push1(`}`);
            } else {
                const [itemsType, loopKey] =
                    kind === "array" ? [`[]${itemType}`, "i"] : [`map[${keyType}]${itemType}`, "k"];
                this.push1(`if aux.${name} != nil {`);
                this.push2(`items := make(${itemsType}, len(aux.${name}))`);
                this.push2(`for ${loopKey}, raw := range aux.${name} {`);
                this.push3(`v, err := ${unmarshal}(raw)`);
                this.push3(`if err != nil {`);
                this.output.push(`${this.indent[4]}return err`);
                this.push3(`}`);
                this.push3(`items[${loopKey}] = v`);
                this.push2(`}`);
                this.push2(`s.${name} = ${ref}items`);
                this.push1(`}`);
            }
        }

        this.push1(`return nil`);
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

        this.addMemberComment(memberNode);

        const tag = this._buildJsonTag(originalKey, isOptionalOrNullable ?? false);
        this.push1(`${fieldName} ${varType}${tag}`);
    }

    private _buildJsonTag(originalKey: string, omitempty: boolean): string {
        if (this.opt.useJsonTags === false) return "";
        const flags = omitempty ? `,omitempty` : "";
        return ` \`json:"${originalKey}${flags}"\``;
    }
}
