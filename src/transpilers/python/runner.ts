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

import { defaultOpts, IZod2PyOpt } from "./options";
import { getLibs } from "./libs";

export class Zod2Py extends Zod2X<IZod2PyOpt> {
    protected readonly commentKey = "#";

    protected lib;
    private baseSchemaAdded = false;
    private typeVars = new Set<string>();
    private pendingTypeVars = new Set<string>();

    constructor(opt: IZod2PyOpt = {}) {
        super({ ...defaultOpts, ...opt });

        this.lib = getLibs();
    }

    protected runAfter(): void {
        if (!this.baseSchemaAdded) {
            this._flushPendingTypeVars(true);
        }
        this._consolidateImports();
    }

    protected runBefore(): void {}

    /**
     * Adds BaseSchema class definition if not already added.
     * This is the base class for all Pydantic models with shared configuration.
     */
    private _addBaseSchema(): void {
        if (this.baseSchemaAdded) return;
        this.baseSchemaAdded = true;

        this.imports.add(this.lib.baseModel);
        if (this.opt.keepKeys !== true) {
            this.imports.add(this.lib.aliasGenerator);
        }

        this.push0("class BaseSchema(BaseModel):");
        this.push1("model_config = ConfigDict(");

        if (this.opt.keepKeys !== true) {
            this.push2("alias_generator=to_camel,");
            this.push2("serialize_by_alias=True,");
            this.push2("populate_by_name=True,");
        }

        this.push2("use_enum_values=True");
        this.push1(")");
        this.push0("");

        this._flushPendingTypeVars(false);
    }

    private _flushPendingTypeVars(prepend: boolean): void {
        if (this.pendingTypeVars.size === 0) return;

        const pending = Array.from(this.pendingTypeVars);
        const lines = pending.map((typeVar) => `${typeVar} = TypeVar('${typeVar}')`);

        if (prepend) {
            this.output = [...lines, "", ...this.output];
        } else {
            lines.forEach((line) => this.push0(line));
            this.push0("");
        }

        pending.forEach((typeVar) => this.typeVars.add(typeVar));

        this.pendingTypeVars.clear();
    }

    /**
     * Declares TypeVars that haven't been declared yet.
     * Adds them right before their first usage.
     * Ex: T = TypeVar('T')
     */
    private _declareNewTypeVars(templates: Set<string>): void {
        const newTypeVars = Array.from(templates).filter(
            (t) => !this.typeVars.has(t) && !this.pendingTypeVars.has(t)
        );

        if (newTypeVars.length === 0) return;

        this.imports.add(this.lib.typeVarType);

        if (!this.baseSchemaAdded) {
            newTypeVars.forEach((typeVar) => this.pendingTypeVars.add(typeVar));
            return;
        }

        newTypeVars.forEach((typeVar) => {
            this.push0(`${typeVar} = TypeVar('${typeVar}')`);
            this.typeVars.add(typeVar);
        });
        this.push0("");
    }

    /**
     * Consolidates multiline imports from the same module and sorts them alphabetically.
     * Modifies this.imports Set to contain consolidated import statements.
     */
    private _consolidateImports(): void {
        const importGroups = new Map<string, Set<string>>();
        const simpleImports = new Set<string>();

        // Group imports by module
        this.imports.forEach((importStatement) => {
            if (importStatement.startsWith("from ") && importStatement.includes(" import ")) {
                // Parse "from module import item" format
                const match = importStatement.match(/^from\s+(\S+)\s+import\s+(.+)$/);
                if (match) {
                    const module = match[1];
                    const items = match[2].split(",").map((item) => item.trim());

                    if (!importGroups.has(module)) {
                        importGroups.set(module, new Set());
                    }

                    items.forEach((item) => {
                        if (item) {
                            importGroups.get(module)!.add(item);
                        }
                    });
                }
            } else if (importStatement.startsWith("import ")) {
                // Simple import statement
                simpleImports.add(importStatement);
            }
        });

        // Clear existing imports
        this.imports.clear();

        // Add consolidated "from" imports back to this.imports (sorted by module)
        const sortedModules = Array.from(importGroups.keys()).sort();
        sortedModules.forEach((module) => {
            const items = Array.from(importGroups.get(module)!).sort();
            if (items.length === 1) {
                this.imports.add(`from ${module} import ${items[0]}`);
            } else {
                this.imports.add(`from ${module} import ${items.join(", ")}`);
            }
        });

        // Add simple imports back to this.imports (sorted)
        const sortedSimpleImports = Array.from(simpleImports).sort();
        sortedSimpleImports.forEach((imp) => {
            this.imports.add(imp);
        });
    }

    protected addImportFromFile(filename: string, namespace: string): string {
        const moduleName = filename.endsWith(".py") ? filename.slice(0, -3) : filename;
        return `import ${moduleName} as ${namespace}`;
    }

    protected getTypeFromExternalNamespace(namespace: string, typeName: string): string {
        return `${namespace}.${typeName}`;
    }

    protected addExtendedType(
        name: string,
        parentNamespace: string,
        aliasOf: string,
        opt?: {
            type?: "union" | "d-union" | "alias";
            isInternal?: boolean;
            templates?: string;
            isClass?: boolean;
        }
    ) {
        const extendedType = opt?.isInternal
            ? aliasOf
            : this.getTypeFromExternalNamespace(parentNamespace, aliasOf);

        const templates = opt?.templates ?? "";

        if (opt?.isClass) {
            // For classes (ASTObject, ASTIntersection), use inheritance with templates
            this.push0(`class ${name}(${extendedType}${templates}): ...\n`);
        } else {
            // For type aliases (primitives, unions, etc.), use TypeAlias
            this.imports.add(this.lib.typeAliasType);
            this.push0(`${name}: TypeAlias = ${extendedType}${templates}\n`);
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
     * Emits an alias/extension declaration early for layered references.
     * It keeps concrete template translations and falls back to declared templates (e.g. [T])
     * for aliases of generic templates.
     */
    protected checkExtendedTypeInclusion(data: ASTNode, type?: "alias" | "union" | "d-union") {
        // Determine if the aliased type is a class (ASTObject or ASTIntersection with newObject)
        const isClass =
            data instanceof ASTObject ||
            (data instanceof ASTIntersection && data.newObject !== undefined);

        const declaredTemplatesFallback =
            data instanceof ASTObject && data.templates.size > 0 && this.isExternalTypeImport(data)
                ? `[${[...data.templates].join(", ")}]`
                : undefined;
        const translatedTemplates = this.getGenericTemplatesTranslation(data);
        const templates = translatedTemplates || declaredTemplatesFallback;

        if (!translatedTemplates && data instanceof ASTObject && data.templates.size > 0) {
            this._declareNewTypeVars(data.templates);
        }

        if (this.isExternalTypeImport(data)) {
            if (data.aliasOf) {
                this.addExtendedType(data.name!, data.parentNamespace!, data.aliasOf!, {
                    type,
                    templates,
                    isClass,
                });
                this.addExternalTypeImport(data);
            }
            return true;
        } else if (data.aliasOf) {
            this.addExtendedType(data.name!, data.parentNamespace!, data.aliasOf, {
                type,
                isInternal: true,
                templates,
                isClass,
            });
            return true;
        }
        return false;
    }

    protected getAnyType = (): string => {
        this.imports.add(this.lib.anyType);
        return "Any";
    };

    protected getBooleanType = (): string => "bool";

    protected getDateType = (): string => {
        this.imports.add(this.lib.datetimeType);
        return "datetime";
    };

    /** Ex: Set[TypeA] */
    protected getSetType = (itemType: string): string => {
        this.imports.add(this.lib.setType);
        return `Set[${itemType}]`;
    };

    protected getStringType = (): string => "str";

    /** Ex: Tuple[TypeA, TypeB] */
    protected getTupleType = (itemsType: string[]): string => {
        this.imports.add(this.lib.tupleType);
        return `Tuple[${itemsType.join(", ")}]`;
    };

    /** Ex: Union[TypeA, TypeB] */
    protected getUnionType = (itemsType: string[]): string => {
        this.imports.add(this.lib.unionType);
        return `Union[${itemsType.join(", ")}]`;
    };

    /** Ex: TypeA & TypeB -> intersection handling */
    protected getIntersectionType = (itemsType: string[]): string => {
        // Python doesn't have intersection types, we'll create a new class
        return itemsType.join(" & "); // This will be handled in transpileIntersection
    };

    /** Ex: int or float depending on isInt flag */
    protected getNumberType = (isInt: boolean, range: { min?: number; max?: number }): string => {
        return isInt ? "int" : "float";
    };

    /** Ex: List[List[TypeA]] */
    protected getArrayType(arrayType: string, arrayDeep: number): string {
        this.imports.add(this.lib.listType);

        let output = `List[${arrayType}]`;

        for (let i = 0; i < arrayDeep - 1; i++) {
            output = `List[${output}]`;
        }

        return output;
    }

    /** Ex: Literal["value"] or Literal[true] or EnumName.ENUM_VALUE */
    protected getLiteralStringType(
        value: string | number | boolean,
        parentEnumNameKey?: [string, string]
    ): string | number {
        if (!parentEnumNameKey) this.imports.add(this.lib.literalType);
        return (
            "Literal[" +
            (parentEnumNameKey
                ? `${parentEnumNameKey[0]}.${Case.constant(Case.snake(parentEnumNameKey[1]))}`
                : typeof value === "boolean"
                  ? Case.capital(value.toString())
                  : `${isNaN(Number(value)) ? `"${value}"` : value}`) +
            "]"
        );
    }

    /** Ex: Dict[TypeA, TypeB] */
    protected getMapType(keyType: string, valueType: string): string {
        this.imports.add(this.lib.dictType);
        return `Dict[${keyType}, ${valueType}]`;
    }

    /** Ex: Dict[TypeA, TypeB] */
    protected getRecordType(keyType: string, valueType: string): string {
        this.imports.add(this.lib.dictType);
        return `Dict[${keyType}, ${valueType}]`;
    }

    protected transpileAliasedType(data: ASTAliasedTypes): void {
        if (this.checkExtendedTypeInclusion(data, "alias")) {
            return;
        }

        let extendedType: string | undefined = undefined;

        this.addComment(data.description);

        if (data instanceof ASTArray) {
            extendedType = this.getAttributeType(data.item);
        } else {
            extendedType = this.getAttributeType(data);
        }

        if (extendedType !== undefined) {
            this.imports.add(this.lib.typeAliasType);
            this.push0(`${data.name}: TypeAlias = ${extendedType}\n`);
        }
    }

    /** Ex:
     *  class MyEnum(str, Enum):
     *      ITEM_KEY1 = "ItemValue1"
     *      ITEM_KEY2 = "ItemValue2"
     *
     *  # Or for mixed types:
     *  class MyEnum(Enum):
     *      ITEM_KEY1 = 1
     *      ITEM_KEY2 = "ItemValue2"
     */
    protected transpileEnum(data: ASTEnum): void {
        if (this.checkExtendedTypeInclusion(data, "alias")) {
            return;
        }

        this.imports.add(this.lib.enumType);

        this.addComment(data.description);

        // Check if all values are strings
        const allStrings = data.values.every(([, value]) => typeof value === "string");
        const enumParent = allStrings ? "(str, Enum)" : "(Enum)";

        this.push0(`class ${data.name}${enumParent}:`);

        data.values.forEach(([key, value]) => {
            const keyName = Case.constant(Case.snake(key));
            const enumValue = typeof value === "string" ? `"${value}"` : `${value}`;
            this.push1(`${keyName} = ${enumValue}`);
        });

        this.push0("");
    }

    protected transpileIntersection(data: ASTIntersection): void {
        if (this.checkExtendedTypeInclusion(data)) {
            return;
        }

        this._addBaseSchema();

        this.addComment(data.description);

        // Use multiple inheritance like C++ for intersections
        const leftType = this.getAttributeType(data.left);
        const rightType = this.getAttributeType(data.right);

        this.push0(`class ${data.name}(${leftType}, ${rightType}): ...\n`);
    }

    protected transpileStruct(data: ASTObject): void {
        if (this.checkExtendedTypeInclusion(data)) {
            return;
        }

        this._addBaseSchema();

        if (data.templates.size > 0) {
            this._declareNewTypeVars(data.templates);
        }

        this.addComment(data.description);
        this._transpileStructAsClass(data);
    }

    protected transpileUnion(data: ASTUnion): void {
        if (
            this.checkExtendedTypeInclusion(
                data,
                data.discriminantKey === undefined ? "union" : "d-union"
            )
        ) {
            return;
        }

        // Python uses Union type aliases (like C++), not merged classes
        this._addBaseSchema();
        this.addComment(data.description);
        const attributesTypes = data.options.map(this.getAttributeType.bind(this));

        // For discriminated unions, use Annotated with Field discriminator
        if (data.discriminantKey) {
            this.imports.add(this.lib.annotatedType);
            this.imports.add(this.lib.fieldImport);
            this.push0(`${data.name} = Annotated[`);
            this.push1(`${this.getUnionType(attributesTypes)},`);
            this.push1(`Field(discriminator='${data.discriminantKey}')`);
            this.push0(`]\n`);
        } else {
            this.push0(`${data.name} = ${this.getUnionType(attributesTypes)}\n`);
        }

        this._createUnionWrapper(data.name);
    }

    /**
     * Creates a wrapper class for a union type.
     * Python/Pydantic needs this for proper serialization/deserialization of unions.
     * Ex:
     *   class UnionItemWrapper(BaseSchema):
     *       data: UnionItem
     */
    private _createUnionWrapper(unionName: string): void {
        const wrapperName = `${unionName}Wrapper`;
        this.push0(`class ${wrapperName}(BaseSchema):`);
        this.push1(`data: ${unionName}`);
        this.push0("");
    }

    /** Ex:
     *  class MyStruct(BaseSchema):
     *      att1: TypeA
     *      att2: Optional[TypeB] = None
     *
     *  # Or with generics:
     *  class MyGenericStruct(BaseSchema, Generic[T]):
     *      data: T
     * */
    private _transpileStructAsClass(data: ASTObject) {
        // Handle generic templates
        let baseClasses = "BaseSchema";
        if (data.templates.size > 0) {
            const templates = Array.from(data.templates);
            this.imports.add(this.lib.genericType);
            baseClasses += `, Generic[${templates.join(", ")}]`;
        }

        this.push0(`class ${data.name}(${baseClasses}):`);

        const hasProperties = Object.keys(data.properties).length > 0;

        if (!hasProperties) {
            this.push1("pass");
            this.push0("");
            return;
        }

        // Generate fields
        for (const [key, value] of Object.entries(data.properties)) {
            const keyName = this.opt.keepKeys === true ? key : Case.snake(key);
            this._transpileMember(keyName, value);
        }

        this.push0("");
    }

    /** For Class attributes.
     *  Ex: attribute1: Optional[TypeA] = None */
    private _transpileMember(memberName: string, memberNode: ASTNode) {
        const pythonType = this.getAttributeType(memberNode);
        const isOptional = memberNode.isOptional || memberNode.isNullable;

        let typeAnnotation: string;
        if (isOptional) {
            this.imports.add(this.lib.optionalType);
            typeAnnotation = pythonType.startsWith("Optional[")
                ? pythonType
                : `Optional[${pythonType}]`;
        } else {
            typeAnnotation = pythonType;
        }

        if (memberNode.description && !memberNode.name && !this.isTranspilerable(memberNode)) {
            this.addComment(memberNode.description, `\n${this.indent[1]}`);
        }

        const defaultValue = isOptional ? " = None" : "";
        this.push1(`${memberName}: ${typeAnnotation}${defaultValue}`);
    }
}
