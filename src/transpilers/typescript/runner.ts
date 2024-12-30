import Case from "case";

import {
    ASTCommon,
    ASTDefintion,
    ASTDiscriminatedUnion,
    ASTEnum,
    ASTIntersection,
    ASTNativeEnum,
    ASTNode,
    ASTObject,
    ASTUnion,
    IZodToXOpt,
    TranspilerableTypes,
    Zod2X,
} from "@/core";

interface IZod2TsOpt extends IZodToXOpt {
    /**
     * Output transpilation using Typescript interfaces or Classes.
     */
    outType?: "interface" | "class";
}

const defaultOpts: IZod2TsOpt = {
    includeComments: true,
    indent: 4,
    skipDiscriminatorNodes: false,

    outType: "interface",
};

export class Zod2Ts extends Zod2X<IZod2TsOpt> {
    constructor(opt: IZod2TsOpt = {}) {
        super(
            {
                enableCompositeTypes: true,
            },
            { ...defaultOpts, ...opt }
        );
    }

    protected runAfter(): void {}
    protected runBefore(): void {}

    protected getComment = (data: string, indent = ""): string => `${indent}// ${data}`;
    protected getAnyType = (): string => "any";
    protected getBooleanType = (): string => "boolean";
    protected getDateType = (): string => "Date";

    /** Ex: Set<TypeA> */
    protected getSetType = (itemType: string): string => `Set<${itemType}>`;

    protected getStringType = (): string => "string";

    /** Ex: [TypeA, TypeB] */
    protected getTupleType = (itemsType: string[]): string => `[${itemsType.join(", ")}]`;

    /** Ex: TypeA | TypeB */
    protected getUnionType = (itemsType: string[]): string => itemsType.join(" | ");

    /** Ex: TypeA & TypeB */
    protected getIntersectionType = (itemsType: string[]): string => itemsType.join(" & ");

    protected getNumberType = (): string => "number";

    /** Ex: Array<Array<TypeA[]>> */
    protected getArrayType(arrayType: string, arrayDeep: number): string {
        let output =
            arrayType.includes("|") || arrayType.includes("&")
                ? `(${arrayType})[]`
                : `${arrayType}[]`;

        for (let i = 0; i < arrayDeep - 1; i++) {
            output = `Array<${output}>`;
        }

        return output;
    }

    protected getLiteralStringType(
        value: string | number,
        parentEnumNameKey?: [string, string]
    ): string | number {
        return parentEnumNameKey
            ? `${parentEnumNameKey[0]}.${parentEnumNameKey[1]}`
            : isNaN(Number(value))
              ? `"${value}"`
              : value;
    }

    /** Ex: Map<TypeA, TypeB> */
    protected getMapType(keyType: string, valueType: string): string {
        return `Map<${keyType}, ${valueType}>`;
    }

    /** Ex: Record<TypeA, TypeB> */
    protected getRecordType(keyType: string, valueType: string): string {
        return `Record<${keyType}, ${valueType}>`;
    }

    /** Ex:
     *  enum {
     *      ItemKey1: 0,            // case of nativeEnum
     *      ItemKey2: "ItemValue2"  // case of Enum
     *  }
     */
    protected transpileEnum(data: (ASTEnum | ASTNativeEnum) & ASTCommon): void {
        this.addComment(data.description);

        this.push0(`export enum ${data.name} {`);

        data.values.forEach((i) => {
            // If enum key starts with number, it is stored between quotes.
            const keyValue = isNaN(Number(i[0].at(0))) ? i[0] : `"${i[0]}"`;

            // Enum value is stored between quotes if not nativeEnum.
            const enumValue = typeof i[1] === "string" ? `"${i[1]}"` : `${i[1]}`;

            this.push1(`${keyValue} = ${enumValue},`);
        });

        this.push0("}\n");
    }

    /** Ex: type TypeC = TypeA & TypeB */
    protected transpileIntersection(data: ASTIntersection & ASTCommon): void {
        this.addComment(data.description);

        const attributesTypes = [data.left, data.right].map(this.getAttributeType.bind(this));

        this.push0(`export type ${data.name} = ${this.getIntersectionType(attributesTypes)};\n`);
    }

    protected transpileStruct(data: ASTObject & ASTCommon): void {
        this.addComment(data.description);

        if (this.opt.outType === "class") {
            this._transpileStructAsClass(data);
        } else {
            this._transpileStructuAsInterface(data);
        }
    }

    /** Ex: type TypeC = TypeA | TypeB */
    protected transpileUnion(data: (ASTUnion | ASTDiscriminatedUnion) & ASTCommon): void {
        this.addComment(data.description);

        const attributesTypes = data.options.map(this.getAttributeType.bind(this));

        this.push0(`export type ${data.name} = ${this.getUnionType(attributesTypes)};\n`);
    }

    /** Ex:
     *  interface MyStruct {
     *      att1: TypeA;
     *      att2?: TypeB;
     *  }
     * */
    private _transpileStructuAsInterface(data: ASTObject & ASTCommon) {
        this.push0(`export interface ${data.name} {`);

        for (const [key, value] of Object.entries(data.properties)) {
            this._transpileMember(Case.camel(key), value);
        }

        this.push0("}\n");
    }

    /** Ex:
     *  class MyStruct {
     *      att1: TypeA;
     *      att2?: TypeB;
     *
     *      constructor(data: MyStruct) {
     *          this.att1 = data.att1;
     *          this.att2 = data.att2;
     *      }
     *  }
     * */
    private _transpileStructAsClass(data: ASTObject & ASTCommon) {
        this.push0(`export class ${data.name} {`);
        const constructorBody: string[] = [];

        for (const [key, value] of Object.entries(data.properties)) {
            this._transpileMember(key, value);
            constructorBody.push(`this.${key} = data.${key};`);
        }

        this.push0("");
        this.push1(`constructor(data: ${data.name}) {`);
        constructorBody.forEach((i) => this.push2(i));
        this.push1("}");

        this.push0("}\n");
    }

    /** For Interface/Class attributes.
     *  Ex: attribute1?: TypeA | null */
    private _transpileMember(memberName: string, memberNode: ASTNode) {
        const keyName = memberNode.isOptional ? `${memberName}?: ` : `${memberName}: `;
        const setNullable = memberNode.isNullable ? " | null" : "";

        if (
            memberNode.description &&
            !(memberNode as ASTDefintion).reference &&
            !this.isTranspilerable(memberNode as TranspilerableTypes)
        ) {
            // Avoid duplicated descriptions for transpiled items.
            this.addComment(memberNode.description, `\n${this.indent[1]}`);
        }

        this.push1(`${keyName}${this.getAttributeType(memberNode)}${setNullable};`);
    }
}
