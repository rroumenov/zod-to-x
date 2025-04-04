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
import { isTranspilerableZodType } from "./zod_helpers";

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

    /**
     * Every external type will be imported from the file where it is defined. Default: true
     */
    useImports?: boolean;
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

    protected constructor(opt: Partial<T>) {
        this.output = [];
        this.imports = new Set<string>();
        this.indent = StringUtils.getIndentationLevels(opt.indent || 4);

        this.opt = opt;
    }

    /**
     * Executes custom logic before  and the transpilation process begins.
     * Useful for additional behaviour required by transpilation procedures.
     */
    protected abstract runBefore(): void;
    protected abstract runAfter(): void;

    /**
     * Adds an import statement for a specific file.
     * @param filename - The name of the file to import from.
     * @param namespace - The namespace to use for the imported types.
     */
    protected abstract addImportFromFile(filename: string, namespace: string): string;

    /**
     * Returns the accessible type name from an external namespace.
     * @param namespace
     * @param typeName
     */
    protected abstract getTypeFromExternalNamespace(namespace: string, typeName: string): string;

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
        return isTranspilerableZodType(token.type);
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
     * Retrieves the equivalent type representation of an AST node in the target language.
     * @param token - The AST node or transpilerable type to convert.
     * @returns A string representing the type in the target language.
     */
    protected getAttributeType(token: ASTNode | TranspilerableTypes) {
        let varType: string = "";

        if (this.isTranspilerable(token as TranspilerableTypes)) {
            varType = (token as TranspilerableTypes).name as string;
        } else if (token.type === "definition") {
            varType =
                this.opt.useImports === true && token.parentNamespace
                    ? this.getTypeFromExternalNamespace(token.parentNamespace, token.reference)
                    : token.reference;
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

    private _getTranspilerableNodes(transpilerQueue: ASTNodes): Map<string, TranspilerableTypes> {
        return new Map([
            ...(this.opt.useImports === false ? transpilerQueue.externalNodes : []),
            ...(this.opt.skipDiscriminatorNodes !== true ? transpilerQueue.discriminatorNodes : []),
            ...transpilerQueue.nodes,
        ]);
    }

    private _getImports(externalNodes: Map<string, TranspilerableTypes>): void {
        const importData = new Map<string, string>();

        externalNodes.forEach((i) => {
            if (i.parentFile && i.parentNamespace && !importData.has(i.parentFile)) {
                importData.set(i.parentFile, i.parentNamespace);
            }
        });

        importData.forEach((namespace, file) => {
            this.imports.add(this.addImportFromFile(file, namespace));
        });
    }

    private _getHeader(): string[] {
        const header = [];

        if (this.opt.header) {
            header.push(...this.opt.header.split("\n").map((i) => this.getComment(i)));
        }

        if (this.imports.size > 0) {
            header.push(...this.imports);

            if (!header.at(-1)?.endsWith("\n")) {
                header.push("");
            }
        }

        return header;
    }

    /**
     * Transpiles a queue of AST nodes into the target language.
     * @param transpilerQueue - An array of transpilerable types (AST nodes with names).
     * @returns The transpiled code as a string.
     */
    transpile(transpilerQueue: ASTNodes): string {
        this.runBefore();

        this._getTranspilerableNodes(transpilerQueue).forEach(this._transpileItem.bind(this));

        this.runAfter();

        if (this.opt.useImports === true) {
            this._getImports(transpilerQueue.externalNodes);
        }

        this.output = [...this._getHeader(), ...this.output];

        return this.output.join("\n");
    }
}
