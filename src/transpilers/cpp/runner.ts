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
     * 
     */
    namespace: string;
    
    /**
     * Output transpilation using C++ Structs or Classes.
     */
    outType?: 'struct' | 'class';
}

const defaultOpts: IZod2CppOpt = {
    includeComments: true,
    indent: 4,
    skipDiscriminatorNodes: false,
    
    namespace: "zodtox",
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

    protected runAfter() {}
    protected runBefore() {}
    
    protected getComment = (data: string, indent = ""): string => `${indent}// ${data}`;
    protected getBooleanType = () => "bool";
    protected getDateType = () => "std::string"; // Representing ISO date as a string
    protected getStringType = () => "std::string";

    /** Ex: std::tuple<TypeA> */
    protected getTupleType = (itemsType: string[]) => `std::tuple<${itemsType.join(", ")}>`;
    
    protected getAnyType = () => {
        this.imports.add(LIB.nlohmann);
        return "nlohmann::json";
    };

    /** Ex: std::set<TypeA> */
    protected getSetType = (itemType: string) => {
        this.imports.add(LIB.set);
        return `std::set<${itemType}>`;
    };
    
    /** Ex: boost::variant<TypeA, TypeB> */
    protected getUnionType = (itemsType: string[]) => {
        this.imports.add(LIB.variant);
        return `boost::variant<${itemsType.join(", ")}>`
    };

    /** Ex: depends on number range (if any). One of:
     *  - std::uint32_t
     *  - std::uint64_t
     *  - std::int32_t
     *  - std::int64_t
     *  - double
     */
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

    /** Ex: std::vector<std::vector<TypeA>> */
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

    /** Ex: std::map<TypeA> */
    protected getMapType(keyType: string, valueType: string) {
        this.imports.add(LIB.map);
        return `std::map<${keyType}, ${valueType}>`;
    }

    protected getRecordType(keyType: string, valueType: string) {
        return this.getMapType(keyType, valueType);
    }

    /** Ex:
     *  enum class EnumA: int {
     *      Item1,
     *      Item2
     *  }
     * 
     *  std::string toString(EnumA item) {
     *      switch (item) {
     *          case EnumA::Item1: return "item1";
     *          case EnumA::Item2: return "item2";
     *      }
     *      return "Unknown";
     *  }
     */
    protected transpileEnum(data: (ASTEnum | ASTNativeEnum) & ASTCommon) {
        this.addComment(data.description);

        const switchCases: string[] = [];

        this.push0(`enum class ${data.name}: int {`);
        data.values.forEach(([key, value], index) => {
            key = StringUtils.capitalize(key);
            value = isNaN(Number(value)) ? value : key; // In case of nativeEnum, key is used as string

            const separator = index + 1 == data.values.length ? "" : ",";
            this.push1(`${StringUtils.capitalize(key)}${separator}`);
            
            switchCases.push(`case ${data.name}::${key}: return "${value}";`);
        });;
        this.push0("};\n");

        this.push0(`std::string toString(${data.name} type) {`);
        this.push1(`switch (type) {`);
        switchCases.forEach(i => this.push2(i));
        this.push1(`}`);
        this.push1(`return "Unknown";`);
        this.push0(`}\n`);
    }

    /** Ex:
     *  - Case of using classes:
     *  class MyClassC: public MyClassA, public MyClassB {
     *      public:
     *      MyClassC() {}
     *  }
     * 
     *  - Case of using structs
     *  struct MyStructC: public MyStructA, public MyStructB {
     *      
     *  }
     */
    protected transpileIntersection(data: ASTIntersection & ASTCommon) {
        this.addComment(data.description);
    
        const leftType = this.getAttributeType(data.left);
        const rightType = this.getAttributeType(data.right);
    
        if (this.opt.outType === "class") {
            this.push0(`class ${data.name} : public ${leftType}, public ${rightType} {`);
            this.push1(`public:`);
            this.push1(`${data.name}() {}\n`);
            this.addComment("Intersection fields are inherited from base classes.", this.indent[1]);
            this.push0("};\n");
        } else {
            this.push0(`struct ${data.name} : public ${leftType}, public ${rightType} {`);
            this.addComment("Intersection fields are inherited from base structs.", this.indent[1]);
            this.push0("};\n");
        }
    }

    /** Ex: using TypeC = boost::variant<TypeA, TypeB> */
    protected transpileUnion(data: (ASTUnion | ASTDiscriminatedUnion) & ASTCommon) {
        this.addComment(data.description);

        const attributesTypes = data.options.map(
            this.getAttributeType.bind(this)
        );

        this.push0(`using ${data.name} = ${this.getUnionType(attributesTypes)};\n`);
    }

    protected transpileStruct(data: ASTObject & ASTCommon) {
        this.addComment(data.description);

        if (this.opt.outType === "class") {
            this._transpileStructAsClass(data);
        } else {
            this._transpileStructAsStruct(data);
        }
    }

    /** Ex:
     *  struct MyStruct {
     *      TypeA attribute1;
     *      TypeB attribute2;
     *  }
     */
    private _transpileStructAsStruct(data: ASTObject & ASTCommon) {
        this.push0(`struct ${data.name} {`);

        Object.entries(data.properties).forEach(([key, value]) => {
            this._transpileMember(key, value);
        });

        this.push0("};\n");
    }

    /** Ex:
     *  class MyClass {
     *      public:
     *      TypeA attribute1;
     *      TypeB attribute2;
     * 
     *      MyClass() {}
     *  }
     */
    private _transpileStructAsClass(data: ASTObject & ASTCommon) {
        this.push0(`class ${data.name} {`);
        this.push1(`public:`);

        Object.entries(data.properties).forEach(([key, value]) => {
            this._transpileMember(key, value);
        });

        this.push1("");
        this.push1(`${data.name}() {}`);
        this.push0("};\n");
    }

    private _transpileMember(memberName: string, memberNode: ASTNode)
    {
        let keyType = this.getAttributeType(memberNode);

        if (memberNode.description &&
            !(memberNode as ASTDefintion).reference &&
            !this.isTranspilerable(memberNode as TranspilerableTypes))
        {
            // Avoid duplicated descriptions for transpiled items.
            this.addComment(memberNode.description, `\n${this.indent[1]}`);
        }

        if (memberNode.isOptional || memberNode.isNullable) {
            this.imports.add(LIB.optional);
            keyType = `boost::optional<${keyType}>`;
        }

        this.push1(`${keyType} ${memberName};`);
    }
}
