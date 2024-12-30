import { ZodFirstPartyTypeKind } from "zod";

import StringUtils, { TIndentationLevels } from "@/utils/string_utils";

import {
    ASTCommon,
    ASTDiscriminatedUnion,
    ASTEnum,
    ASTIntersection,
    ASTNativeEnum,
    ASTNode,
    ASTNodes,
    ASTObject,
    ASTUnion,
    TranspilerableTypes,
} from "./ast_types";

/**
 * Optional user settings
 */
export interface IZodToXOpt extends Record<string, any> {
    /**
     * Text to add as a comment at the beginning of the output.
     * Useful for adding headers or documentation notes.
     */
    header?: string;

    /**
     * Number of spaces to use for indentation in the generated code.
     * Defaults to 4 if not specified.
     */
    indent?: number;

    /**
     * Determines whether to include comments in the transpiled code.
     * Defaults to `true`.
     */
    includeComments?: boolean;

    /**
     * When set to `true`, this option excludes discriminator enums from the output types.
     * Specifically, it prevents the inclusion of `ZodEnum` or `ZodNativeEnum` schemas that are used
     * solely as discriminator keys in a `ZodDiscriminatedUnion`. This helps avoid adding
     * enum types to the generated output when unnecessary.
     */
    skipDiscriminatorNodes?: boolean;
}

/**
 * Internal transpiler configuration
 */
interface IInternalOpts {
    /**
     * Indicates whether the target language supports composite types like unions and intersections
     * directly, allowing variables to be typed as a union or intersection of other types without
     * the need to define a new type.
     *
     * **Explanation:**
     * Some languages allow you to declare a variable with a type that is a union (`|`) or
     * intersection (`&`) of multiple types without the need to create a specific composite type
     * beforehand. This provides flexibility in type definitions and reduces the need for
     * boilerplate code.
     *
     * **Examples:**
     *
     * **TypeScript:**
     * ```typescript
     * // Union type: var1 can be either TypeA or TypeB
     * let var1: TypeA | TypeB;
     *
     * // Intersection type: var2 must satisfy both TypeA and TypeB
     * let var2: TypeA & TypeB;
     * ```
     *
     * **C++ (not directly supported):**
     * C++ does not support defining a variable as a union or intersection of types without creating
     * a specific type first. Instead, you need to define a new type (e.g., using `union`, `struct`,
     * or inheritance) before declaring a variable.
     *
     * *Union equivalent:*
     * ```cpp
     * // Define a union type
     * union AorB {
     *     TypeA a;
     *     TypeB b;
     * };
     *
     * // Declare a variable of the union type
     * AorB var1;
     * ```
     *
     * *Intersection equivalent (using multiple inheritance):*
     * ```cpp
     * // Define a struct that inherits from both TypeA and TypeB
     * struct AandB : public TypeA, public TypeB {};
     *
     * // Declare a variable of the intersection type
     * AandB var2;
     * ```
     *
     * **Note:** Because of these differences, when transpiling to languages like C++, keep this
     * flag disabled to ensure that 'typeName' is required also for ZodUnions and ZodIntersections.
     */
    enableCompositeTypes: boolean;
}

/**
 * Abstract base class for transpiling Zod schemas into other programming languages.
 * Extend this class and implement the abstract methods to define how each Zod type
 * should be converted to the target language's syntax.
 */
export abstract class Zod2X<T extends IZodToXOpt> {
    protected output: string[];
    protected indent: TIndentationLevels;
    protected imports: Set<string>;

    protected opt: Partial<T>;

    private inOpt: IInternalOpts;

    protected constructor(inOpt: IInternalOpts, opt: Partial<T>) {
        this.output = [];
        this.imports = new Set<string>();
        this.indent = StringUtils.getIndentationLevels(opt.indent || 4);

        this.opt = opt;
        this.inOpt = inOpt;
    }

    /**
     * Executes custom logic before  and the transpilation process begins.
     * Useful for additional behaviour required by transpilation procedures.
     */
    protected abstract runBefore(): void;
    protected abstract runAfter(): void;

    /**
     * Returns a comment.
     */
    protected abstract getComment(data: string, indent?: string): string;

    /**
     * Returns the keyword representing a string type in the target language.
     */
    protected abstract getStringType(): string;

    /**
     * Returns the keyword representing a boolean type in the target language.
     */
    protected abstract getBooleanType(): string;

    /**
     * Returns the keyword representing a number type in the target language.
     * @param isInt - Indicates if the number is an integer.
     * @param range - Optional range constraints for the number.
     */
    protected abstract getNumberType(isInt: boolean, range: { min?: number; max?: number }): string;

    /**
     * Returns the representation of a literal string or number in the target language.
     * @param value - The literal value to represent.
     * @param parentEnumNameKey - Optional tuple containing the parent enum name and key reference.
     */
    protected abstract getLiteralStringType(
        value: string | number,
        parentEnumNameKey?: [string, string]
    ): string | number;

    /**
     * Returns the keyword representing a generic 'any' type in the target language.
     */
    protected abstract getAnyType(): string;

    /**
     * Returns the keyword representing a date type in the target language.
     * @returns A string representing the date type.
     */
    protected abstract getDateType(): string;

    /**
     * Returns the representation of a tuple type in the target language.
     * @param itemsType - An array of strings representing the types of the tuple's elements.
     * @returns A string representing the tuple type.
     */
    protected abstract getTupleType(itemsType: string[]): string;

    /**
     * Returns the representation of a set type in the target language.
     * @param itemType - A string representing the type of the set's items.
     * @returns A string representing the set type.
     */
    protected abstract getSetType(itemType: string): string;

    /**
     * Returns the representation of a map type in the target language.
     * @param keyType - A string representing the type of the map's keys.
     * @param valueType - A string representing the type of the map's values.
     * @returns A string representing the map type.
     */
    protected abstract getMapType(keyType: string, valueType: string): string;

    /**
     * Returns the representation of a record type in the target language.
     * @param keyType - A string representing the type of the record's keys.
     * @param valueType - A string representing the type of the record's values.
     * @returns A string representing the record type.
     */
    protected abstract getRecordType(keyType: string, valueType: string): string;

    /**
     * Returns the representation of an intersection type in the target language.
     * @param itemsType - An array of strings representing the types to intersect.
     * @returns A string representing the intersection type.
     */
    protected abstract getIntersectionType(itemsType: string[]): string;

    /**
     * Returns the representation of a union type in the target language.
     * @param itemsType - An array of strings representing the types to union.
     * @returns A string representing the union type.
     */
    protected abstract getUnionType(itemsType: string[]): string;

    /**
     * Returns the representation of an array type in the target language, accounting for array depth.
     * @param arrayType - A string representing the type of the array's elements.
     * @param arrayDeep - The number of dimensions for multi-dimensional arrays.
     * @returns A string representing the array type.
     */
    protected abstract getArrayType(arrayType: string, arrayDeep: number): string;

    /**
     * Transpiles an enum type from the AST to the target language.
     * @param data - The AST node representing the enum.
     */
    protected abstract transpileEnum(data: (ASTEnum | ASTNativeEnum) & ASTCommon): void;

    /**
     * Transpiles a struct (object) type from the AST to the target language.
     * @param data - The AST node representing the struct.
     */
    protected abstract transpileStruct(data: ASTObject & ASTCommon): void;

    /**
     * Transpiles a union type from the AST to the target language.
     * @param data - The AST node representing the union.
     */
    protected abstract transpileUnion(data: (ASTUnion | ASTDiscriminatedUnion) & ASTCommon): void;

    /**
     * Transpiles an intersection type from the AST to the target language.
     * @param data - The AST node representing the intersection.
     */
    protected abstract transpileIntersection(data: ASTIntersection & ASTCommon): void;

    /**
     * Determines if the given type token can be transpiled into the target language.
     * @param token - The type token to check.
     * @returns `true` if the type is transpilerable; otherwise, `false`.
     */
    protected isTranspilerable(token: TranspilerableTypes) {
        return (
            token.type === ZodFirstPartyTypeKind.ZodEnum ||
            token.type === ZodFirstPartyTypeKind.ZodNativeEnum ||
            token.type === ZodFirstPartyTypeKind.ZodObject ||
            (token.name &&
                (token.type === ZodFirstPartyTypeKind.ZodUnion ||
                    token.type === ZodFirstPartyTypeKind.ZodDiscriminatedUnion ||
                    token.type === ZodFirstPartyTypeKind.ZodIntersection))
        );
    }

    // Push with indentation helpers
    protected push0 = (data: string) => this.output.push(`${this.indent[0]}${data}`);
    protected push1 = (data: string) => this.output.push(`${this.indent[1]}${data}`);
    protected push2 = (data: string) => this.output.push(`${this.indent[2]}${data}`);
    protected push3 = (data: string) => this.output.push(`${this.indent[3]}${data}`);

    /**
     * Adds a comment to the transpiled output.
     * @param data - The comment text to add.
     * @param indent - Optional indentation to apply before the comment.
     */
    protected addComment(data = "", indent = "") {
        if (data && this.opt.includeComments) {
            this.output.push(this.getComment(data, indent));
        }
    }

    /**
     * Checks if composite types (unions and intersections) are enabled.
     * Throws an error if composite types are not supported by the target language.
     */
    private _checkCompositeFlag() {
        if (!this.inOpt.enableCompositeTypes) {
            throw new Error(
                `Composite Types cannot be performed for this output Language. ` +
                    `Add the missing 'typeName' to transpilerable schemas`
            );
        }
    }

    /**
     * Retrieves the equivalent type representation of an AST node in the target language.
     * @param token - The AST node or transpilerable type to convert.
     * @returns A string representing the type in the target language.
     */
    protected getAttributeType(token: ASTNode | TranspilerableTypes) {
        let varType: string = "";

        if (this.isTranspilerable(token as TranspilerableTypes)) {
            varType = (token as TranspilerableTypes).name as string;
        } else if (token.type === "definition") {
            varType = token.reference;
        } else if (token.type === ZodFirstPartyTypeKind.ZodString) {
            varType = this.getStringType();
        } else if (token.type === ZodFirstPartyTypeKind.ZodBoolean) {
            varType = this.getBooleanType();
        } else if (token.type === ZodFirstPartyTypeKind.ZodAny) {
            varType = this.getAnyType();
        } else if (token.type === ZodFirstPartyTypeKind.ZodDate) {
            varType = this.getDateType();
        } else if (token.type === ZodFirstPartyTypeKind.ZodLiteral) {
            const parentEnum =
                token.parentEnumName && token.parentEnumKey
                    ? ([token.parentEnumName, token.parentEnumKey] as [string, string])
                    : undefined;
            varType = this.getLiteralStringType(token.value, parentEnum) as string;
        } else if (token.type === ZodFirstPartyTypeKind.ZodSet) {
            varType = this.getSetType(this.getAttributeType(token.value));
        } else if (token.type === ZodFirstPartyTypeKind.ZodNumber) {
            varType = this.getNumberType(token.constraints.isInt, {
                min: token.constraints.min,
                max: token.constraints.max,
            });
        } else if (token.type === ZodFirstPartyTypeKind.ZodTuple) {
            const tupleAttributeTypes = token.items.map(this.getAttributeType.bind(this));
            varType = this.getTupleType(tupleAttributeTypes);
        } else if (
            token.type === ZodFirstPartyTypeKind.ZodMap ||
            token.type === ZodFirstPartyTypeKind.ZodRecord
        ) {
            const [key, value] = [token.key, token.value].map(this.getAttributeType.bind(this));

            if (token.type === ZodFirstPartyTypeKind.ZodMap) {
                varType = this.getMapType(key, value);
            } else {
                varType = this.getRecordType(key, value);
            }
        } else if (
            !(token as TranspilerableTypes).name &&
            token.type === ZodFirstPartyTypeKind.ZodIntersection
        ) {
            this._checkCompositeFlag();

            const items = [token.left, token.right].map(this.getAttributeType.bind(this));
            varType = this.getIntersectionType(items);
        } else if (
            !(token as TranspilerableTypes).name &&
            (token.type === ZodFirstPartyTypeKind.ZodUnion ||
                token.type === ZodFirstPartyTypeKind.ZodDiscriminatedUnion)
        ) {
            this._checkCompositeFlag();

            const items: string[] = token.options.map(this.getAttributeType.bind(this));
            varType = this.getUnionType(items);
        } else {
            console.log("  # Unknown attribute equivalent for ---> ", token.type);
        }

        return token.arrayDimension ? this.getArrayType(varType, token.arrayDimension) : varType;
    }

    /**
     * Transpiles a single item from the transpiler queue.
     * @param item - The transpilerable type to transpile.
     */
    private _transpileItem(item: TranspilerableTypes) {
        if (
            item.type === ZodFirstPartyTypeKind.ZodEnum ||
            item.type === ZodFirstPartyTypeKind.ZodNativeEnum
        ) {
            this.transpileEnum(item);
        } else if (item.type === ZodFirstPartyTypeKind.ZodObject) {
            this.transpileStruct(item);
        } else if (
            item.type === ZodFirstPartyTypeKind.ZodUnion ||
            item.type === ZodFirstPartyTypeKind.ZodDiscriminatedUnion
        ) {
            this.transpileUnion(item);
        } else if (item.type === ZodFirstPartyTypeKind.ZodIntersection) {
            this.transpileIntersection(item);
        } else {
            throw new Error(
                `Unexpected type for transpilation: ${(item as TranspilerableTypes).type}`
            );
        }
    }

    /**
     * Transpiles a queue of AST nodes into the target language.
     * @param transpilerQueue - An array of transpilerable types (AST nodes with names).
     * @returns The transpiled code as a string.
     */
    transpile(transpilerQueue: ASTNodes): string {
        this.runBefore();

        if (this.opt.skipDiscriminatorNodes !== true) {
            transpilerQueue.discriminatorNodes.forEach(this._transpileItem.bind(this));
        }

        transpilerQueue.nodes.forEach(this._transpileItem.bind(this));

        this.runAfter();

        let header = [];

        if (this.opt.header) {
            header.push(...this.opt.header.split("\n").map((i) => this.getComment(i)));
        }

        if (this.imports.size > 0) {
            header.push(...this.imports);

            if (!header.at(-1)?.endsWith("\n")) {
                header.push("");
            }
        }

        this.output = [...header, ...this.output];

        return this.output.join("\n");
    }
}
