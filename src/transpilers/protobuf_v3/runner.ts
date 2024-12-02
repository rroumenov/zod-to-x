import {
    ASTCommon, ASTDiscriminatedUnion, ASTEnum, ASTIntersection, ASTNativeEnum, ASTObject, ASTUnion,
    IZodToXOpt, TranspilerableTypes, Zod2X
} from '@/core';
import StringUtils from '@/utils/string_utils';

const allowedKeyTypes = [
    "int32", "int64", "uint32", "uint64", "sint32", "sint64",
    "fixed32", "fixed64", "sfixed32", "sfixed64", "bool", "string"
];

const INT32_RANGES  = [-2_147_483_648, 2_147_483_647];
const UINT32_RANGES = [0, 4_294_967_295];

interface IZod2ProtoV3Opt extends Omit<IZodToXOpt, "skipDiscriminatorNodes"> {
    /**
     * Name of the protobuf file package.
     */
    packageName?: string;

    /**
     * Protobuf follows the snake_case convention for field names, but camelCase can also be used.
     */
    useCamelCase?: boolean;
}

const defaultOpts: IZod2ProtoV3Opt = {
    includeComments: true,
    indent: 4,
    useCamelCase: false,

    skipDiscriminatorNodes: true,   // Not required for protobuf files
}

export class Zod2ProtoV3 extends Zod2X
{
    constructor(opt: IZod2ProtoV3Opt = {}) {
        super({
            enableCompositeTypes: true
        }, { ...defaultOpts, ...opt });
    }
    
    protected addComment(data?: string, indent?: string): void {
        if (data && this.opt.includeComments) {
            this.output += `${indent || ""}/** ${data} */\n`;
        }
    }
    
    protected getUnionType = (): string => { /** Covered by "transpileUnion" method */ return "" };

    protected getBooleanType = (): string => "bool";
    protected getStringType = (): string => "string";

    protected getNumberType = (isInt: boolean, range: {min?: number, max?: number}): string => {
        if (!isInt) {
            return "double";
        }

        if (range?.min! >= UINT32_RANGES[0]) {
            if (range?.max! <= UINT32_RANGES[1]) {
                return "uint32";
            }
            else {
                return "uint64";
            }
        }
        else {
            if (range?.max! <= INT32_RANGES[1] &&
                range?.min! >= INT32_RANGES[0])
            {
                return "int32";
            }
            else {
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
        return `repeated ${itemType}`;
    };

    protected getTupleType = (itemsType: string[]): string => {
        throw new Error(
            "Protobuf v3 does not support tuples directly. Consider defining a message type."
        );
    };

    protected getIntersectionType = (itemsType: string[]): string => {
        throw new Error("Protobuf v3 does not support intersection types directly.");
    };

    protected getArrayType(arrayType: string, arrayDeep: number): string {
        if (arrayDeep === 1) {
            return `repeated ${arrayType}`;
        }
        else {
            throw new Error(
                "Protobuf v3 does not support multidimensional arrays directly. " +
                "You need to define nested message types for deeper arrays"
            );
        }
    }

    protected getLiteralStringType(value: string | number): string | number {
        if (typeof value === 'string') {
            return this.getStringType();
        }
        else if (typeof value === 'number') {
            return this.getNumberType(Number.isInteger(value), {min: value, max: value});
        }
        else {
            throw new Error(`Protobuf v3 does not support Literals for this value type: ${value}`);
        }
    }

    protected getMapType(keyType: string, valueType: string): string {
        if (!allowedKeyTypes.includes(keyType)) {
            throw new Error(
                `Protobuf map keys must be an integral or string type, got '${keyType}'.`
            );
        }

        return `map<${keyType}, ${valueType}>`;
    }

    protected getRecordType(keyType: string, valueType: string): string {
        return this.getMapType(keyType, valueType);
    }

    protected transpileEnum(data: (ASTEnum | ASTNativeEnum) & ASTCommon): void {
        this.addComment(data.description);

        this.output += `enum ${data.name} {\n`;

        data.values.forEach(([key, value], index) => {
            if (Number.isInteger(key.at(0))) {
                throw new Error(`Enumerate item name cannot start with number: ${key}`);
            }
            
            this.output += `${this.indent}${key} = ${index};\n`
        });

        this.output += "}\n\n";
    }

    protected transpileIntersection(data: ASTIntersection & ASTCommon): void {
        throw new Error(`Protobuf does not support message intersections.`);
    }

    protected transpileStruct(data: ASTObject & ASTCommon): void {
        this.addComment(data.description);

        this.output += `message ${data.name} {\n`;

        Object.entries(data.properties).forEach(([key, value], index) => {
            if (value.description &&
                !this.isTranspilerable(value as TranspilerableTypes))
            {
                // Avoid duplicated descriptions for transpiled items.
                this.addComment(value.description, `\n${this.indent}`);
            }

            this.output +=
                `${this.indent}${this.getAttributeType(value)} ${this._adaptField(key)} = ${index + 1};\n`;
        });

        this.output += "}\n\n";
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
    protected transpileUnion(data: (ASTUnion | ASTDiscriminatedUnion) & ASTCommon): void {
        this.addComment(data.description);
        
        const attributesTypes = data.options.map(this.getAttributeType.bind(this));

        if (attributesTypes.find( i => i.startsWith("map<") || i.startsWith("repeated ") )) {
            throw new Error("Map and Repeated fields are not suported by Protobuf oneOf");
        }

        this.output += `message ${data.name} {\n`;
        this.output += `${this.indent}oneof ${this._adaptField(data.name + "Oneof")} {\n`;

        attributesTypes.forEach((item, index) => {
            this.output +=
                `${this.indent}${this.indent}${item} ${this._adaptField(item)} = ${index + 1};\n`;
        });

        this.output += `${this.indent}}\n`;
        this.output += "}\n\n";
    }

    protected runBefore(): void {
        this.imports.add(`syntax = "proto3";\n`);

        if (this.opt?.packageName) {
            this.imports.add(`package ${this.opt?.packageName};\n`);
        }
    }

    protected runAfter(): void {}

    /**
     * Adapt field name according to user input.
     * @param fieldName 
     * @returns 
     */
    private _adaptField(fieldName: string) {
        if (this.opt.useCamelCase) {
            return fieldName.includes("_")
                ? StringUtils.toCamelCase(fieldName)
                : StringUtils.toNonCapitalized(fieldName);
        }
        else {
            return StringUtils.toSnakeCase(fieldName);
        }
    }
}