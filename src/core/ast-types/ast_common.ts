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
 * Represents a usage of any existing ASTNode. Used to reduce node size.
 */
export class ASTDefinition extends ASTCommon {
    name: string;
    instanceType: string;
    constraints?: Record<string, any>;

    // In case of model definition that uses a generic template. Shall follow the same order as
    // templates definition.
    templatesTranslation: Pick<ASTCommon, "parentFile" | "parentNamespace" | "aliasOf">[];

    constructor(data: ASTDefinition & ASTCommon) {
        super(data);

        this.name = data.name;
        this.instanceType = data.instanceType;
        this.constraints = data.constraints;
        this.templatesTranslation = data.templatesTranslation;
    }
}

export type ASTType = ASTNode | ASTDefinition;

export type ASTNodes = {
    nodes: Map<string, ASTNode>;
    warnings: string[];
};

export class ASTGenericType {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
