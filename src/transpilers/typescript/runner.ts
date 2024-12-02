import {
    ASTCommon, ASTDefintion, ASTDiscriminatedUnion, ASTEnum, ASTIntersection, ASTNativeEnum,
    ASTObject, ASTUnion, IZodToXOpt, TranspilerableTypes, Zod2X
} from '@/core';

interface IZod2TsOpt extends IZodToXOpt {
    /**
     * Output transpilation using Typescript interfaces or Classes.
     */
    outType?: 'interface' | 'class'
}

const defaultOpts: IZod2TsOpt = {
    includeComments: true,
    indent: 4,
    skipDiscriminatorNodes: false,
    
    outType: 'interface',
}

export class Zod2Ts extends Zod2X
{
    constructor(opt: IZod2TsOpt = {}) {
        super({
            enableCompositeTypes: true
        }, { ...defaultOpts, ...opt });
    }

    protected addComment(data?: string, indent?: string): void {
        if (data && this.opt.includeComments) {
            this.output += `${indent || ""}/** ${data} */\n`;
        }
    }
    
    protected runAfter(): void {}
    protected runBefore(): void {}

    protected getAnyType = (): string => "any";
    protected getBooleanType = (): string => "boolean";
    protected getDateType = (): string => "Date";
    protected getSetType = (itemType: string): string => `Set<${itemType}>`;
    protected getStringType = (): string => "string";
    protected getTupleType = (itemsType: string[]): string => `[${itemsType.join(', ')}]`;
    protected getUnionType = (itemsType: string[]): string => itemsType.join(" | ");
    protected getIntersectionType = (itemsType: string[]): string => itemsType.join(" & ");
    protected getNumberType = (): string => "number";

    protected getArrayType(arrayType: string, arrayDeep: number): string {
        let output = (
            arrayType.includes("|") || arrayType.includes("&")
            ? `(${arrayType})[]`
            : `${arrayType}[]`
        );

        for (let i = 0; i < arrayDeep - 1; i++) {
            output = `Array<${output}>`;
        }
        
        return output;
    }

    protected getLiteralStringType(value: string | number): string | number {
        return isNaN(Number(value)) ? `"${value}"` : value;
    }

    protected getMapType(keyType: string, valueType: string): string {
        return `Map<${keyType}, ${valueType}>`;
    }

    protected getRecordType(keyType: string, valueType: string): string {
        return `Record<${keyType}, ${valueType}>`;
    }

    protected transpileEnum(data: (ASTEnum | ASTNativeEnum) & ASTCommon): void {
        this.addComment(data.description);

        this.output += `export enum ${data.name} {\n`;

        data.values.forEach(i => {
            // If enum key starts with number, it is stored between quotes.
            const keyValue = isNaN(Number(i[0].at(0))) ? i[0] : `"${i[0]}"`;

            // Enum value is stored between quotes if not nativeEnum.
            const enumValue = typeof i[1] === 'string' ? `"${i[1]}"` : `${i[1]}`;
            this.output += `${this.indent}${keyValue} = ${enumValue},\n`
        });

        this.output += "}\n\n";
    }

    protected transpileIntersection(data: ASTIntersection & ASTCommon): void {
        this.addComment(data.description);

        const attributesTypes = [data.left, data.right].map(this.getAttributeType.bind(this));
        
        this.output +=
            `export type ${data.name} = ${this.getIntersectionType(attributesTypes)};\n\n`;     
    }

    protected transpileStruct(data: ASTObject & ASTCommon): void {
        this.addComment(data.description);

        if (this.opt.outType === "class") {
            this._transpileStructAsClass(data);
        }
        else {
            this._transpileStructuAsInterface(data);
        }
    }

    protected transpileUnion(data: (ASTUnion | ASTDiscriminatedUnion) & ASTCommon): void {
        this.addComment(data.description);
        
        const attributesTypes = data.options.map(this.getAttributeType.bind(this));
        
        this.output += `export type ${data.name} = ${this.getUnionType(attributesTypes)};\n\n`;
    }

    private _transpileStructuAsInterface(data: ASTObject & ASTCommon) {
        this.output += `export interface ${data.name} {\n`;

        for(const [key, value] of Object.entries(data.properties)) {
            const keyName = value.isOptional ? `${key}?: ` : `${key}: `;
            const setNullable = value.isNullable ? " | null" : "";

            if (value.description &&
                !(value as ASTDefintion).reference &&
                !this.isTranspilerable(value as TranspilerableTypes))
            {
                // Avoid duplicated descriptions for transpiled items.
                this.addComment(value.description, `\n${this.indent}`);
            }

            this.output +=
                `${this.indent}${keyName}${this.getAttributeType(value)}${setNullable};\n`;
        }

        this.output += "}\n\n";
    }

    private _transpileStructAsClass(data: ASTObject & ASTCommon) {
        this.output += `export class ${data.name} {\n`;
        const constructorBody: string[] = [];

        for(const [key, value] of Object.entries(data.properties)) {
            const keyName = value.isOptional ? `${key}?: ` : `${key}: `;
            const setNullable = value.isNullable ? " | null" : "";

            if (value.description &&
                !(value as ASTDefintion).reference &&
                !this.isTranspilerable(value as TranspilerableTypes))
            {
                // Avoid duplicated descriptions for transpiled items.
                this.addComment(value.description, `\n${this.indent}`);
            }

            this.output +=
                `${this.indent}${keyName}${this.getAttributeType(value)}${setNullable};\n`;

            constructorBody.push(`${this.indent}${this.indent}this.${key} = data.${key};`);
        }

        this.output += [
            `\n${this.indent}constructor(data: ${data.name}) {`,
            ...constructorBody,
            `${this.indent}}\n`
        ].join('\n');

        this.output += "}\n\n";
    }
}