import * as Simple from "./ast_simple";
import * as Complex from "./ast_complex";

/**
 * Shared properties for all AST node types.
 */
export abstract class ASTCommon {
    arrayDimension?: number;
    description?: string;
    isNullable?: boolean;
    isOptional?: boolean;

    /**
     * File where the transpilerable model is defined and the reference used to group imports.
     * Used to generate import statements in the transpiled code.
     */
    parentFile?: string;
    parentNamespace?: string;

    /**
     * For Layered Modeling.
     * Stores the used type from an external model. Used to create models inheritance.
     */
    aliasOf?: string;

    constructor(data: ASTCommon) {
        this.arrayDimension = data.arrayDimension;
        this.description = data.description;
        this.isNullable = data.isNullable;
        this.isOptional = data.isOptional;

        this.parentFile = data.parentFile;
        this.parentNamespace = data.parentNamespace;
        this.aliasOf = data.aliasOf;
    }
}

/**
 * Represents a general AST node, encompassing various Zod schema types.
 */
export type ASTNode =
    | Simple.ASTString
    | Simple.ASTNumber
    | Simple.ASTBoolean
    | Simple.ASTLiteral
    | Simple.ASTDate
    | Simple.ASTAny
    | Complex.ASTObject
    | Complex.ASTUnion
    | Complex.ASTIntersection
    | Complex.ASTEnum
    | Complex.ASTMap
    | Complex.ASTSet
    | Complex.ASTTuple
    | Complex.ASTArray;

/**
 * Nodes that are always transpiled to a type alias.
 */
export type ASTAliasedTypes =
    | Simple.ASTString
    | Simple.ASTNumber
    | Simple.ASTBoolean
    | Simple.ASTLiteral
    | Simple.ASTDate
    | Simple.ASTAny
    | Complex.ASTMap
    | Complex.ASTSet
    | Complex.ASTTuple
    | Complex.ASTArray;

/**
 * Translation of a generic template of a generic type instance. Named types are referenced by
 * name (and file, if external), and the rest of types (basic types, arrays, ...) by their AST.
 */
export type ASTTemplateTranslation = Pick<
    ASTCommon,
    "parentFile" | "parentNamespace" | "aliasOf"
> & {
    type?: ASTType;
};

/**
 * Represents a usage of any existing ASTNode. Used to reduce node size.
 */
export class ASTDefinition extends ASTCommon {
    static readonly kind = "ASTDefinition";

    name: string;

    /**
     * Kind of the referenced AST node (e.g. "ASTObject"). See `getASTKind`.
     */
    instanceType: string;
    constraints?: Record<string, any>;

    // In case of model definition that uses a generic template. Shall follow the same order as
    // templates definition.
    templatesTranslation: ASTTemplateTranslation[];

    constructor(data: ASTDefinition & ASTCommon) {
        super(data);

        this.name = data.name;
        this.instanceType = data.instanceType;
        this.constraints = data.constraints;
        this.templatesTranslation = data.templatesTranslation;
    }
}

export type ASTType = ASTNode | ASTDefinition;

/**
 * Returns the kind of an AST node, which is the name of its class (e.g. "ASTObject"). Unlike
 * `constructor.name`, it is not modified by minifiers.
 */
export function getASTKind(node: unknown): string | undefined {
    return (node as { constructor?: { kind?: string } })?.constructor?.kind;
}

export type ASTNodes = {
    nodes: Map<string, ASTNode>;
    warnings: string[];
};

export class ASTGenericType {
    static readonly kind = "ASTGenericType";

    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
