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
    | Complex.ASTTuple;

/**
 * Represents a type definition in the AST. Used to reduce node size and identify
 * schemas that can be referenced in a transpilation process.
 */
export class ASTDefintion extends ASTCommon {
    name: string;
    instanceType: string;
    constraints?: Record<string, any>;

    constructor(data: ASTDefintion & ASTCommon) {
        super(data);

        this.name = data.name;
        this.instanceType = data.instanceType;
        this.constraints = data.constraints;
    }
}

export type ASTType = ASTNode | ASTDefintion;

export type ASTNodes = {
    nodes: Map<string, ASTNode>;
    warnings: string[];
};
