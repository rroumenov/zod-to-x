import Case from "case";

import {
    ASTAliasedTypes,
    ASTArray,
    ASTEnum,
    ASTIntersection,
    ASTNode,
    ASTObject,
    ASTUnion,
    Zod2X,
} from "@/core";

import { defaultOpts, IZod2TsOpt } from "./options";

export class Zod2Ts extends Zod2X<IZod2TsOpt> {
    constructor(opt: IZod2TsOpt = {}) {
        super({ ...defaultOpts, ...opt });
    }

    protected runAfter(): void {}
    protected runBefore(): void {}

    protected addImportFromFile(filename: string, namespace: string): string {
        const filenameWithoutExtension = filename.endsWith(".ts")
            ? filename.slice(0, -3)
            : filename;
        return `import * as ${namespace} from "./${filenameWithoutExtension}";`;
    }

    protected getTypeFromExternalNamespace(namespace: string, typeName: string): string {
        return `${namespace}.${typeName}`;
    }

    protected addExtendedType(
        name: string,
        parentNamespace: string,
        aliasOf: string,
        opt?: { type?: "union" | "d-union" | "alias" }
    ) {
        const extendedType = this.getTypeFromExternalNamespace(parentNamespace, aliasOf);

        if (opt?.type === "alias") {
            this.push0(`export type ${name} = ${extendedType};\n`);
        } else if (this.opt.outType === "class") {
            if (opt?.type === "d-union") {
                this.push0(`export type ${name} = ${extendedType};\n`);
            } else {
                this.push0(`export class ${name} extends ${extendedType} {}\n`);
            }
        } else {
            if (opt?.type === "union" || opt?.type === "d-union") {
                this.push0(`export type ${name} = ${extendedType};\n`);
            } else {
                this.push0(`export interface ${name} extends ${extendedType} {}\n`);
            }
        }
    }

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
            ? `${parentEnumNameKey[0]}.${Case.pascal(parentEnumNameKey[1])}`
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

    protected transpileAliasedType(data: ASTAliasedTypes): void {
        if (this.isExternalTypeImport(data)) {
            if (data.aliasOf) {
                this.addExtendedType(data.name!, data.parentNamespace!, data.aliasOf!, {
                    type: "alias",
                });
            }
            return;
        }

        let extendedType: string | undefined = undefined;

        if (data instanceof ASTArray) {
            extendedType = this.getAttributeType(data.item);
        } else {
            extendedType = this.getAttributeType(data);
        }

        if (extendedType !== undefined) {
            this.push0(`export type ${data.name} = ${extendedType};\n`);
        }
    }

    /** Ex:
     *  enum {
     *      ItemKey1: 0,            // case of nativeEnum
     *      ItemKey2: "ItemValue2"  // case of Enum
     *  }
     */
    protected transpileEnum(data: ASTEnum): void {
        if (this.isExternalTypeImport(data)) {
            if (data.aliasOf) {
                this.addExtendedType(data.name, data.parentNamespace!, data.aliasOf!, {
                    type: "alias",
                });
            }
            return;
        }

        this.addComment(data.description);

        this.push0(`export enum ${data.name} {`);

        data.values.forEach((i) => {
            // If enum key starts with number, it is stored between quotes.
            const key = Case.pascal(i[0]);
            const keyValue = isNaN(Number(key.at(0))) ? key : `"${key}"`;

            // Enum value is stored between quotes if not nativeEnum.
            const enumValue = typeof i[1] === "string" ? `"${i[1]}"` : `${i[1]}`;

            this.push1(`${keyValue} = ${enumValue},`);
        });

        this.push0("}\n");
    }

    /** Ex:
     * // Interface output
     * // Class output if non-object intersection
     * type TypeC = TypeA & TypeB
     *
     * // Class output all-object intersection
     * class TypeC {
     *     ...attributesTypeA,
     *     ...attributesTypeB
     *
     *     constructor(data: TypeC) {
     *         ...attributesAssignment
     *     }
     * }
     * */
    protected transpileIntersection(data: ASTIntersection): void {
        if (this.isExternalTypeImport(data)) {
            if (data.aliasOf) {
                this.addExtendedType(data.name, data.parentNamespace!, data.aliasOf!);
            }
            return;
        }

        if (this.opt.outType === "class" && data.newObject) {
            this.addComment(data.newObject?.description);
            this._transpileStructAsClass(data.newObject);
        } else {
            this.addComment(data.description);

            const attributesTypes = [data.left, data.right].map(this.getAttributeType.bind(this));

            this.push0(
                `export type ${data.name} = ${this.getIntersectionType(attributesTypes)};\n`
            );
        }
    }

    protected transpileStruct(data: ASTObject): void {
        if (this.isExternalTypeImport(data)) {
            if (data.aliasOf) {
                this.addExtendedType(data.name, data.parentNamespace!, data.aliasOf!);
            }
            return;
        }

        this.addComment(data.description);

        if (this.opt.outType === "class") {
            this._transpileStructAsClass(data);
        } else {
            this._transpileStructuAsInterface(data);
        }
    }

    /** Ex:
     * // Interface output
     * // Class output for Discriminated Union or non-objects union
     * type TypeC = TypeA | TypeB
     *
     * // Class output for all-object Union
     * class TypeC {
     *     ...attributesTypeA,
     *     ...attributesTypeB
     *
     *     constructor(data: TypeC) {
     *         ...attributesAssignment
     *     }
     * }
     * */
    protected transpileUnion(data: ASTUnion): void {
        if (this.isExternalTypeImport(data)) {
            if (data.aliasOf) {
                this.addExtendedType(data.name, data.parentNamespace!, data.aliasOf!, {
                    type: data.discriminantKey === undefined ? "union" : "d-union",
                });
            }
            return;
        }

        if (this.opt.outType === "class" && (data as ASTUnion).newObject) {
            this.addComment((data as ASTUnion).newObject?.description);
            this._transpileStructAsClass((data as ASTUnion).newObject!);
        } else {
            this.addComment(data.description);

            const attributesTypes = data.options.map(this.getAttributeType.bind(this));

            this.push0(`export type ${data.name} = ${this.getUnionType(attributesTypes)};\n`);
        }
    }

    /** Ex:
     *  interface MyStruct {
     *      att1: TypeA;
     *      att2?: TypeB;
     *  }
     * */
    private _transpileStructuAsInterface(data: ASTObject) {
        this.push0(`export interface ${data.name} {`);

        for (const [key, value] of Object.entries(data.properties)) {
            this._transpileMember(this.opt.keepKeys === true ? key : Case.camel(key), value);
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
    private _transpileStructAsClass(data: ASTObject) {
        this.push0(`export class ${data.name} {`);
        const constructorBody: string[] = [];

        for (const [key, value] of Object.entries(data.properties)) {
            const keyName = this.opt.keepKeys === true ? key : Case.camel(key);
            this._transpileMember(keyName, value);
            constructorBody.push(`this.${keyName} = data.${keyName};`);
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

        if (memberNode.description && !memberNode.name && !this.isTranspilerable(memberNode)) {
            // Avoid duplicated descriptions for transpiled items.
            this.addComment(memberNode.description, `\n${this.indent[1]}`);
        }

        this.push1(`${keyName}${this.getAttributeType(memberNode)}${setNullable};`);
    }
}
