import { ZodFirstPartyTypeKind } from "zod";

/**
 * Shared properties for all AST node types.
 */
export type ASTCommon = {
    arrayDimension?: number;
    description?: string;
    isNullable?: boolean;
    isOptional?: boolean;
};

/**
 * AST (Abstract Syntax Tree) type for each Zod Schema that encapsulates
 * additional information beyond just the schema type.
 */
export type ASTLiteral = {
    type: ZodFirstPartyTypeKind.ZodLiteral;
    value: any;
    parentEnumName?: string;
    parentEnumKey?: string;
};

export type ASTNumber = {
    type: ZodFirstPartyTypeKind.ZodNumber;
    constraints: { min?: number; max?: number; isInt: boolean };
};

export type ASTSet = {
    type: ZodFirstPartyTypeKind.ZodSet;
    value: ASTNode;
};

export type ASTTuple = {
    type: ZodFirstPartyTypeKind.ZodTuple;
    items: ASTNode[];
};

export type ASTRecord = {
    type: ZodFirstPartyTypeKind.ZodRecord;
    key: ASTNode;
    value: ASTNode;
};

export type ASTMap = {
    type: ZodFirstPartyTypeKind.ZodMap;
    key: ASTNode;
    value: ASTNode;
};

export type ASTEnum = {
    type: ZodFirstPartyTypeKind.ZodEnum;
    name: string;
    values: [string, string | number][];
};

export type ASTNativeEnum = {
    type: ZodFirstPartyTypeKind.ZodNativeEnum;
    name: string;
    values: [string, string | number][];
};

export type ASTObject = {
    type: ZodFirstPartyTypeKind.ZodObject;
    name: string;
    properties: Record<string, ASTNode>;
};

export type ASTUnion = {
    type: ZodFirstPartyTypeKind.ZodUnion;
    name: string;
    options: ASTNode[];

    /**
     * Allows to create a new object with the union properties. Used in languages that do not
     * have a variant type or discriminated union cannot be used.
     */
    newObject?: ASTCommon & ASTObject;
};

export type ASTDiscriminatedUnion = {
    type: ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
    name: string;
    options: ASTNode[];
    discriminantKey?: string;
};

export type ASTIntersection = {
    type: ZodFirstPartyTypeKind.ZodIntersection;
    name: string;
    left: ASTNode;
    right: ASTNode;

    /**
     * Allows to create a new object with the union properties. Used in languages that do not
     * support multiple inheritance.
     */
    newObject?: ASTCommon & ASTObject;
};

/**
 * Represents a type definition in the AST. Used to reduce node size and identify
 * schemas that can be referenced in a transpilation process.
 */
export type ASTDefintion = ASTCommon & {
    type: "definition";
    reference: string;
    referenceType: ZodFirstPartyTypeKind;
    discriminantValue?: string;

    /**
     * Namespace where the transpilerable model is defined. Used to use import statements in the
     * transpiled code.
     */
    parentNamespace?: string;
};

/**
 * Represents a general AST node, encompassing various Zod schema types.
 */
export type ASTNode = ASTCommon &
    (
        | { type: ZodFirstPartyTypeKind.ZodString }
        | { type: ZodFirstPartyTypeKind.ZodBoolean }
        | { type: ZodFirstPartyTypeKind.ZodDate }
        | { type: ZodFirstPartyTypeKind.ZodAny }
        | { type: ZodFirstPartyTypeKind.ZodLazy; getType: () => ASTNode }
        | ASTLiteral
        | ASTNumber
        | ASTSet
        | ASTTuple
        | ASTRecord
        | ASTMap
        | ASTDefintion

        // Types that may not require explicit definitions in some languages (allowed composite types)
        // (e.g., unions or intersections in TypeScript).
        | ASTUnion
        | ASTDiscriminatedUnion
        | ASTIntersection
    );

/**
 * Represents schemas that can be directly transpiled into types in other programming languages.
 */
export type TranspilerableTypes = ASTCommon &
    (ASTEnum | ASTNativeEnum | ASTObject | ASTUnion | ASTDiscriminatedUnion | ASTIntersection) & {
        /**
         * File where the transpilerable model is defined and the reference used to group imports.
         * Used to generate import statements in the transpiled code.
         */
        parentFile?: string;
        parentNamespace?: string;
    };

export type ASTNodes = {
    nodes: Map<string, TranspilerableTypes>;
    externalNodes: Map<string, TranspilerableTypes>;
    discriminatorNodes: Map<string, TranspilerableTypes>;
    warnings: string[];
};
