import Case from "case";

import {
    ASTAliasedTypes,
    ASTEnum,
    ASTIntersection,
    ASTObject,
    ASTUnion,
    IZod2AstOpt,
    NotTranspilerableTypeError,
    Zod2Ast,
    Zod2X,
} from "@/core";
import { ZodObject } from "@/lib/zod_helpers";
import { INT32_RANGES, UINT32_RANGES } from "@/utils/number_limits";
import StringUtils from "@/utils/string_utils";

import { defaultOpts, IZod2ProtoV3Opt } from "./options";

const allowedKeyTypes = [
    "int32",
    "int64",
    "uint32",
    "uint64",
    "sint32",
    "sint64",
    "fixed32",
    "fixed64",
    "sfixed32",
    "sfixed64",
    "bool",
    "string",
];

class Zod2ProtoV3 extends Zod2X<IZod2ProtoV3Opt> {
    constructor(opt: IZod2ProtoV3Opt = {}) {
        super({ ...defaultOpts, ...opt });
    }

    protected getUnionType = (): string => {
        /** Covered by "transpileUnion" method */
        return "";
    };

    protected addImportFromFile(filename: string, namespace: string): string {
        // Zod2ProtoV3 does not support layered modeling.
        return "";
    }

    protected getTypeFromExternalNamespace(namespace: string, typeName: string): string {
        // Zod2ProtoV3 does not support layered modeling.
        return "";
    }

    protected addExtendedType(name: string, parentNamespace: string, aliasOf: string): void {
        // Zod2ProtoV3 does not support layered modeling.
        return;
    }

    protected transpileAliasedType(data: ASTAliasedTypes): void {
        // Zod2ProtoV3 does not need to transpile aliased types.
        return;
    }

    protected getComment = (data: string, indent = ""): string => `${indent}// ${data}`;
    protected getBooleanType = (): string => "bool";
    protected getStringType = (): string => "string";

    protected getNumberType = (isInt: boolean, range: { min?: number; max?: number }): string => {
        if (!isInt) {
            return "double";
        }

        if (range?.min! >= UINT32_RANGES[0]) {
            if (range?.max! <= UINT32_RANGES[1]) {
                return "uint32";
            } else {
                return "uint64";
            }
        } else {
            if (range?.max! <= INT32_RANGES[1] && range?.min! >= INT32_RANGES[0]) {
                return "int32";
            } else {
                return "int64";
            }
        }
    };

    protected getAnyType = (): string => {
        this.imports.add(`import "google/protobuf/any.proto";`);
        return "google.protobuf.Any";
    };

    protected getDateType = (): string => {
        this.imports.add(`import "google/protobuf/timestamp.proto";`);
        return "google.protobuf.Timestamp";
    };

    protected getSetType = (itemType: string): string => {
        return this.getArrayType(itemType, 1);
    };

    /**
     * @description Determines the equivalent Protobuf type for a tuple based on its item types.
     *
     * Protobuf v3 does not directly support tuples. However, if all the types
     * in the tuple are identical, it can be represented as a `repeated` field
     * of that type. If the tuple contains mixed types, Protobuf cannot represent
     * it directly, and an alternative approach (e.g., defining a Protobuf message)
     * should be considered.
     *
     * @param itemsType - An array of strings representing the types of the tuple elements.
     * @returns A string representing the Protobuf type for the tuple.
     *          If all tuple elements are of the same type, it returns a `repeated` field of that
     *          type.
     * @throws NotTranspilerableTypeError if the tuple contains mixed types.
     */
    protected getTupleType = (itemsType: string[]): string => {
        const uniqueTypes = new Set(itemsType);

        if (uniqueTypes.size === 1) {
            return this.getArrayType(itemsType[0], 1);
        } else {
            throw new NotTranspilerableTypeError(
                "Protobuf v3 does not support mixed-type tuples. Consider defining a message type."
            );
        }
    };

    protected getIntersectionType = (itemsType: string[]): string => {
        throw new NotTranspilerableTypeError(
            "Protobuf v3 does not support intersection types directly."
        );
    };

    protected getArrayType(arrayType: string, arrayDeep: number): string {
        if (arrayDeep === 1) {
            return `repeated ${arrayType}`;
        } else {
            throw new NotTranspilerableTypeError(
                "Protobuf v3 does not support multidimensional arrays directly. " +
                    "You need to define nested message types for deeper arrays"
            );
        }
    }

    protected getLiteralStringType(value: string | number): string | number {
        if (typeof value === "string") {
            return this.getStringType();
        } else if (typeof value === "number") {
            return this.getNumberType(Number.isInteger(value), { min: value, max: value });
        } else {
            throw new NotTranspilerableTypeError(
                `Protobuf v3 does not support Literals for this value type: ${value}`
            );
        }
    }

    protected getMapType(keyType: string, valueType: string): string {
        if (!allowedKeyTypes.includes(keyType)) {
            throw new NotTranspilerableTypeError(
                `Protobuf map keys must be an integral or string type, got '${keyType}'.`
            );
        }

        return `map<${keyType}, ${valueType}>`;
    }

    protected getRecordType(keyType: string, valueType: string): string {
        return this.getMapType(keyType, valueType);
    }

    protected transpileEnum(data: ASTEnum): void {
        if (data.isFromDiscriminatedUnion === true) {
            // Injected enum from ZodDiscriminatedUnion are not transpiled.
            return;
        }

        this.addComment(data.description);

        this.push0(`enum ${data.name} {`);

        data.values.forEach(([key, value], index) => {
            if (Number.isInteger(key.at(0))) {
                throw new NotTranspilerableTypeError(
                    `Enumerate item name cannot start with number: ${key}`
                );
            }

            this.push1(`${key} = ${index};`);
        });

        this.push0("}\n");
    }

    protected transpileIntersection(data: ASTIntersection): void {
        throw new NotTranspilerableTypeError(`Protobuf does not support message intersections.`);
    }

    protected transpileStruct(data: ASTObject): void {
        this.addComment(data.description);

        this.push0(`message ${data.name} {`);

        Object.entries(data.properties).forEach(([key, value], index) => {
            if (value.description && !this.isTranspilerable(value)) {
                // Avoid duplicated descriptions for transpiled items.
                this.addComment(value.description, `\n${this.indent[1]}`);
            }

            this.push1(`${this.getAttributeType(value)} ${this._adaptField(key)} = ${index + 1};`);
        });

        this.push0("}\n");
    }

    /**
     * Transpiles a Zod union or discriminated union into a Protobuf-compatible `oneof` message.
     *
     * @limitations Currently supports `oneOf` for options that can be represented as a
     *              Protobuf message or enum. Other types are not yet supported.
     * @param data  The AST representation of a union or discriminated union, including its
     *              common metadata.
     * @example
     * Input:
     * {
     *   name: "UserContact",
     *   options: ["EmailContact", "PhoneContact", "SocialContact"],
     *   description: "Represents different ways to contact a user."
     * }
     *
     * Generated Output:
     * message UserContact {
     *   oneof user_contact_oneof {
     *     EmailContact email_contact = 1;
     *     PhoneContact phone_contact = 2;
     *     SocialContact social_contact = 3;
     *   }
     * }
     */
    protected transpileUnion(data: ASTUnion): void {
        this.addComment(data.description);

        const attributesTypes = data.options.map(this.getAttributeType.bind(this));

        if (attributesTypes.find((i) => i.startsWith("map<") || i.startsWith("repeated "))) {
            throw new NotTranspilerableTypeError(
                "Map and Repeated fields are not suported by Protobuf oneOf"
            );
        }

        this.push0(`message ${data.name} {`);
        this.push1(`oneof ${StringUtils.lowerFirstChar(this._adaptField(data.name + "Oneof"))} {`);

        attributesTypes.forEach((item, index) => {
            this.push2(
                `${item} ${StringUtils.lowerFirstChar(this._adaptField(item))} = ${index + 1};`
            );
        });

        this.push1(`}`);
        this.push0("}\n");
    }

    protected runBefore(): void {
        this.preImports.add(`syntax = "proto3";`);

        if (this.opt?.packageName) {
            this.preImports.add(`package ${this.opt?.packageName};`);
        }
    }

    protected runAfter(): void {}

    /**
     * Adapt field name according to user input.
     * @param fieldName
     * @returns
     */
    private _adaptField(fieldName: string) {
        if (this.opt.keepKeys === true) {
            return fieldName;
        } else {
            return Case.snake(fieldName);
        }
    }
}

/**
 * Converts a Zod schema into a Protocol Buffers v3 definition.
 *
 * @param schema - The Zod object schema to be converted.
 * @param opt - Optional configuration for the conversion process.
 * @param opt.strict - Whether to enforce strict mode during AST generation.
 * @param opt.packageName - The package name to use in the generated Protocol Buffers definition.
 * @param opt.keepKeys - Whether to keep the original property names in the generated file instead
 *                       of converting them to snake_case as per Protobuf conventions.
 * @param opt.header - Custom header text to include in the generated file.
 * @param opt.indent - The indentation style to use in the generated file.
 * @param opt.includeComments - Whether to include comments in the generated Protocol Buffers
 *                              definition.
 * @returns The Protocol Buffers v3 definition as a string.
 */
export function zod2ProtoV3(
    schema: ZodObject<any>,
    opt: Pick<IZod2AstOpt, "strict"> &
        Pick<
            IZod2ProtoV3Opt,
            "packageName" | "keepKeys" | "header" | "indent" | "includeComments"
        > = {}
): string {
    const astNode = new Zod2Ast({ strict: opt.strict }).build(schema);
    return new Zod2ProtoV3(opt).transpile(astNode);
}
