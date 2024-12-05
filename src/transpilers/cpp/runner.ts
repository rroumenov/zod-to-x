import {
    ASTCommon, ASTDefintion, ASTDiscriminatedUnion, ASTEnum, ASTIntersection, ASTNativeEnum,
    ASTNode, ASTObject, ASTUnion, IZodToXOpt, TranspilerableTypes, Zod2X
} from '@/core';
import { INT32_RANGES, UINT32_RANGES } from '@/utils/number_limits';
import StringUtils from '@/utils/string_utils';

const LIB = {
    integers: "#include <cstdint>",
    map: "#include <map>",
    nlohmann: "#include <nlohmann/json.hpp>",
    optional: "#include <boost/optional.hpp>",
    set: "#include <set>",
    string: "#include <string>",
    variant: "#include <boost/variant.hpp>",
    vector: "#include <vector>"
};

interface IZod2CppOpt extends IZodToXOpt {
    /**
     * Output transpilation using C++ Structs or Classes.
     */
    outType?: 'struct' | 'class'
}

const defaultOpts: IZod2CppOpt = {
    includeComments: true,
    indent: 4,
    skipDiscriminatorNodes: false,
    
    outType: 'struct',
}

export class Zod2Cpp extends Zod2X {
    constructor(opt = {}) {
        super(
            {
                enableCompositeTypes: false,
            },
            { ...defaultOpts, ...opt }
        );
    }

    protected getIntersectionType = (): string => { /** Covered by "transpileIntersection" method */ return "" };

    protected addComment(data = "", indent = "") {
        if (data && this.opt.includeComments) {
            this.output += `${indent}/** ${data} */\n`;
        }
    }

    protected runAfter() {}
    protected runBefore() {}
    
    protected getBooleanType = () => "bool";
    protected getDateType = () => "std::string"; // Representing ISO date as a string
    protected getStringType = () => "std::string";
    protected getTupleType = (itemsType: string[]) => `std::tuple<${itemsType.join(", ")}>`;
    
    protected getAnyType = () => {
        this.imports.add(LIB.nlohmann);
        return "nlohmann::json";
    };

    protected getSetType = (itemType: string) => {
        this.imports.add(LIB.set);
        return `std::set<${itemType}>`;
    };
    
    protected getUnionType = (itemsType: string[]) => {
        this.imports.add(LIB.variant);
        return `boost::variant<${itemsType.join(", ")}>`
    };

    protected getNumberType = (isInt: boolean, range: {min?: number, max?: number}): string => {
        if (!isInt) {
            return "double";
        }

        this.imports.add(LIB.integers);

        if (range?.min! >= UINT32_RANGES[0]) {
            if (range?.max! <= UINT32_RANGES[1]) {
                return "std::uint32_t";
            }
            else {
                return "std::uint64_t";
            }
        }
        else {
            if (range?.max! <= INT32_RANGES[1] &&
                range?.min! >= INT32_RANGES[0])
            {
                return "std::int32_t";
            }
            else {
                return "std::int64_t";
            }
        }
    };

    protected getArrayType(arrayType: string, arrayDeep: number) {
        this.imports.add(LIB.vector);

        let output = `std::vector<${arrayType}>`;
        for (let i = 0; i < arrayDeep - 1; i++) {
            output = `std::vector<${output}>`;
        }
        return output;
    }

    protected getLiteralStringType(value: string | number) {
        return isNaN(Number(value))
            ? this.getStringType()
            : this.getNumberType(
                Number.isInteger(value),
                {min: value as number, max: value as number}
            );
    }

    protected getMapType(keyType: string, valueType: string) {
        this.imports.add(LIB.map);
        return `std::map<${keyType}, ${valueType}>`;
    }

    protected getRecordType(keyType: string, valueType: string) {
        return `std::map<${keyType}, ${valueType}>`;
    }

    protected transpileEnum(data: (ASTEnum | ASTNativeEnum) & ASTCommon) {
        this.addComment(data.description);

        const switchCases: string[] = [];

        this.output += `enum class ${data.name}: int {\n`;
        this.output += data.values.map(([key, value]) => {
            key = StringUtils.capitalize(key);
            value = isNaN(Number(value)) ? value : key; // In case of nativeEnum, key is used as string

            switchCases.push(
                `${this.indent}${this.indent}case ${data.name}::${key}: return "${value}";`
            );

            return `${this.indent}${StringUtils.capitalize(key)}`;
        }).join('\n');
        this.output += "\n};\n\n";

        this.output += `std::string toString(${data.name} type) {\n`;
        this.output += `${this.indent}switch (type) {\n`;
        this.output += switchCases.join(',\n');
        this.output += `\n${this.indent}}\n`;
        this.output += `${this.indent}return "Unknown;\n`;
        this.output += `}\n\n`;
    }

    protected transpileIntersection(data: ASTIntersection & ASTCommon) {
        this.addComment(data.description);
    
        const leftType = this.getAttributeType(data.left);
        const rightType = this.getAttributeType(data.right);
    
        if (this.opt.outType === "class") {
            this.output += `class ${data.name} : public ${leftType}, public ${rightType} {\n`;
            this.output += `public:\n    ${data.name}() {}\n\n`;
            this.output += "    // Intersection fields are inherited from base classes.\n";
            this.output += "};\n\n";
        } else {
            this.output += `struct ${data.name} : public ${leftType}, public ${rightType} {\n`;
            this.output += "    // Intersection fields are inherited from base structs.\n";
            this.output += "};\n\n";
        }
    }

    protected transpileStruct(data: ASTObject & ASTCommon) {
        this.addComment(data.description);

        if (this.opt.outType === "class") {
            this._transpileStructAsClass(data);
        } else {
            this._transpileStructAsStruct(data);
        }
    }

    protected transpileUnion(data: (ASTUnion | ASTDiscriminatedUnion) & ASTCommon) {
        this.addComment(data.description);

        const attributesTypes = data.options.map(
            this.getAttributeType.bind(this)
        );

        this.output += `using ${data.name} = ${this.getUnionType(attributesTypes)};\n\n`;
    }

    private _transpileStructAsStruct(data: ASTObject & ASTCommon) {
        this.output += `struct ${data.name} {\n`;

        Object.entries(data.properties).forEach(([key, value]) => {
            this._transpileMember(key, value);
        });

        this.output += "};\n\n";
    }

    private _transpileStructAsClass(data: ASTObject & ASTCommon) {
        this.output += `class ${data.name} {\n${this.indent}public:\n`;

        Object.entries(data.properties).forEach(([key, value]) => {
            this._transpileMember(key, value);
        });

        this.output += `\n`;
        this.output += `${this.indent}${data.name}() {}\n`;
        this.output += "};\n\n";
    }

    private _transpileMember(memberName: string, memberNode: ASTNode)
    {
        let keyType = this.getAttributeType(memberNode);

        if (memberNode.description &&
            !(memberNode as ASTDefintion).reference &&
            !this.isTranspilerable(memberNode as TranspilerableTypes))
        {
            // Avoid duplicated descriptions for transpiled items.
            this.addComment(memberNode.description, `\n${this.indent}`);
        }

        if (memberNode.isOptional || memberNode.isNullable) {
            this.imports.add(LIB.optional);
            keyType = `boost::optional<${keyType}>`;
        }

        this.output += `${this.indent}${keyType} ${memberName};\n`;
    }
}
