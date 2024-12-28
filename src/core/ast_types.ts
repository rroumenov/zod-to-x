import { ZodFirstPartyTypeKind } from "zod";

/**
 * AST (Abstract Syntax Tree) type for each Zod Schema that encapsulates
 * additional information beyond just the schema type.
 */
export type ASTLiteral = {
    type: ZodFirstPartyTypeKind.ZodLiteral;
    value: any;
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
};

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
 * Represents a type definition in the AST. Used to reduce node size and identify
 * schemas that can be referenced in a transpilation process.
 */
export type ASTDefintion = ASTCommon & {
    type: "definition";
    reference: string;
    referenceType: ZodFirstPartyTypeKind;
    discriminantValue?: string;
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
    (ASTEnum | ASTNativeEnum | ASTObject | ASTUnion | ASTDiscriminatedUnion | ASTIntersection);

export type ASTNodes = {
    nodes: TranspilerableTypes[];
    discriminatorNodes: TranspilerableTypes[];
};
