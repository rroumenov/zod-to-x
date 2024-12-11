import Case from 'case';

import {
    ASTCommon, ASTDefintion, ASTDiscriminatedUnion, ASTEnum, ASTIntersection, ASTNativeEnum,
    ASTNode, ASTObject, ASTUnion, TranspilerableTypes, Zod2X
} from '@/core';
import { INT32_RANGES, UINT32_RANGES } from '@/utils/number_limits';

import { LIB } from './libs';
import { getNlohmannOptionalHelper } from './nlohmann';
import { defaultOpts, IZod2CppOpt } from './options';

/** Required data to serialize structure/class attribute. */
interface IStructAttributeSerialData {
    origName: string;
    snakeName: string;
    typeName: string;
    required: boolean;
}

/** Required data to serialize enumerate. */
interface IEnumItemSerialData {
    origValue: string | number;
    enumName: string;
}

export class Zod2Cpp extends Zod2X<IZod2CppOpt> {
    private serializers: string[];

    constructor(opt = {}) {
        super(
            {
                enableCompositeTypes: false,
            },
            { ...defaultOpts, ...opt }
        );

        this.imports.add("#pragma once\n");

        this.serializers = [];
    }

    protected getIntersectionType = (): string => { /** Covered by "transpileIntersection" method */ return "" };

    protected runBefore() {}

    protected runAfter() {
        this.output = this.output.map(i => `${this.indent[1]}${i}`);

        this.output.unshift(`namespace ${this.opt.namespace} {`);
        this.output.push("}");

        if (this.opt.skipSerialize !== true &&
            this.serializers.length > 0)
        {
            this.imports.add(LIB.nlohmann);

            this.output.push("")
            this.output.push(`namespace ${this.opt.namespace} {`);

            if (this.imports.has(LIB.optional) && !this.opt.includeNulls) {
                this.serializers.unshift(...getNlohmannOptionalHelper(this.opt.indent as number));
            }

            this.serializers = this.serializers.map(i => `${this.indent[1]}${i}`);
            this.output.push(...this.serializers);
            this.output.push("}");
        }
    }
    
    protected getComment = (data: string, indent = ""): string => `${indent}// ${data}`;
    protected getDateType = () => this.getStringType(); // Representing ISO date as a string
    protected getBooleanType = () => "bool";
    
    protected getStringType = () => {
        this.imports.add(LIB.string);
        return "std::string";
    };

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
     */
    protected transpileEnum(data: (ASTEnum | ASTNativeEnum) & ASTCommon) {
        this.addComment(data.description);

        const serializeData: IEnumItemSerialData[] = [];

        this.push0(`enum class ${data.name}: int {`);
        data.values.forEach(([key, value], index) => {
            key = Case.pascal(key);
            value = isNaN(Number(value)) ? value : key; // In case of nativeEnum, key is used as string

            const separator = index + 1 == data.values.length ? "" : ",";
            this.push1(`${key}${separator}`);
            
            serializeData.push({enumName: key, origValue: value});
        });;
        this.push0("};\n");

        this._createEnumSerializer(data.name, serializeData);
        this._createEnumDeserializer(data.name, serializeData);
    }

    /** Ex:
     *  - Case of using classes:
     *  class MyClassC: public MyClassA, public MyClassB {
     *  public:
     *      MyClassC() = default;
     *      virtual ~MyClass() = default;      
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
            this.push0(`public:`);
            this.push1(`${data.name}() = default;`);
            this.push1(`virtual ~${data.name}() = default;`);
            this.push0("");
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

        const serializeData: IStructAttributeSerialData[] = [];

        Object.entries(data.properties).forEach(([key, value]) => {
            const snakeName = Case.snake(key);
            const typeName = this._transpileMember(snakeName, value);
            serializeData.push({
                origName: key,
                snakeName,
                typeName,
                required: !(value.isNullable || value.isOptional),
            });
        });

        this.push0("};\n");
        
        this._createStructSerializer(data.name, serializeData);
        this._createStructDeserializer(data.name, serializeData);
    }

    /** Ex:
     *  class MyClass {
     *  private:
     *      TypeA attribute1;
     *      TypeB attribute2;
     * 
     *  public:
     *      MyClass() = default;
     *      virtual ~MyClass() = default;
     * 
     *      const TypeA& get_attribute1() const { return this->attribute1; }
     *      TypeA& get_mut attribute1() { return this->attribute1; }
     *      void set_attribute1(TypeA& value) { this->attribute1 = value; }
     *      [...]
     *  }
     */
    private _transpileStructAsClass(data: ASTObject & ASTCommon) {
        this.push0(`class ${data.name} {`);
        this.push0(`private:`);

        const setterGetter: string[] = [];
        const serializeData: IStructAttributeSerialData[] = [];

        Object.entries(data.properties).forEach(([key, value]) => {
            const snakeName = Case.snake(key);
            const typeName = this._transpileMember(snakeName, value);
            setterGetter.push(
                ...this._createSetterGetter(
                    snakeName,
                    typeName,
                    !(value.isNullable || value.isOptional)
                )
            );
            serializeData.push({
                origName: key,
                snakeName,
                typeName,
                required: !(value.isNullable || value.isOptional),
            })
        });

        this.push0("");
        this.push0(`public:`)
        this.push1(`${data.name}() = default;`);
        this.push1(`virtual ~${data.name}() = default;`);

        setterGetter.forEach(i => this.push1(i));

        this.push0("};\n");

        this._createClassSerializer(data.name, serializeData);
        this._createClassDeserializer(data.name, serializeData);
    }

    /**
     * @description Transpiles an individual member of a C++ class based on the provided ASTNode.
     * 
     * @param memberName - The name of the member variable to transpile.
     * @param memberNode - The ASTNode defining the member's type, description, and other
     *                     attributes.
     * 
     * @returns - The C++ type of the member, modified if it is nullable or optional.
     */
    private _transpileMember(memberName: string, memberNode: ASTNode)
    {
        let keyType = this.getAttributeType(memberNode);
        const origType = keyType;

        if (memberNode.description &&
            !(memberNode as ASTDefintion).reference &&
            !this.isTranspilerable(memberNode as TranspilerableTypes))
        {
            // Avoid duplicated descriptions for transpiled items.
            this.push1("");
            this.addComment(memberNode.description, `${this.indent[1]}`);
        }

        if (memberNode.isOptional || memberNode.isNullable) {
            this.imports.add(LIB.optional);
            keyType = `boost::optional<${keyType}>`;
        }

        this.push1(`${keyType} ${Case.snake(memberName)};`);

        return origType;
    }

    /**
     * @description Creates getter and setter enumHelpers for a C++ class member variable.
     * 
     * @param memberName - The name of the member variable.
     * @param memberType - The C++ type of the member variable.
     * @param [required] - Whether the member is required (default is `false`).
     * 
     * @returns - An array of strings representing the C++ getter and setter enumHelpers.
     */
    private _createSetterGetter(memberName: string, memberType: string, required?:boolean): string[]
    {
        const result: string[] = [];
        
        result.push("");
        if (required) {
            result.push(
                `const ${memberType}& get_${memberName}() const { return this->${memberName}; }`
            );
            result.push(
                `${memberType}& get_mut_${memberName}() { return this->${memberName}; }`
            );
            result.push(
                `void set_${memberName}(const ${memberType}& value) { this->${memberName} = value; }`
            );
        }
        else {
            result.push(
                `${memberType} get_${memberName}() const { return this->${memberName}; }`
            );
            result.push(
                `void set_${memberName}(${memberType} value) { this->${memberName} = value; }`
            );
        }

        return result;
    }

    /**
     * @description Generates a JSON serializer for a struct. Each required field is serialized
     *              directly, and optional fields are checked for existence before serialization.
     * Ex:
     *      inline void to_json(json& j, const MyStruct& x) {
     *          j = json::object();
     *          j["requiredField"] = x.required_field;
     *          if (x.optional_field) {
     *              j["optionalField"] = x.optional_field;
     *          }
     *      }
     * @param parent - Name of the serialized structure
     * @param childs - Structure attributes data.
     */
    private _createStructSerializer(parent: string, childs: IStructAttributeSerialData[])
    {
        this._push0(this.serializers, `inline void to_json(json& j, const ${parent}& x) {`);
        this._push1(this.serializers, `j = json::object();`);
        childs.forEach(i => {
            if (i.required || this.opt.includeNulls === true) {
                this._push1(this.serializers, `j["${i.origName}"] = x.${i.snakeName};`);
            }
            else {
                this._push1(
                    this.serializers,
                    `set_opt<${i.typeName}>(j, "${i.origName}", x.${i.snakeName});`
                );
            }
        });
        this._push0(this.serializers, "}\n");
    }

    /**
     * @description Generates a JSON deserializer for a struct. Each required field is deserialized
     *              using at, while optional fields are handled with get_opt.
     * Ex:
     *      inline void from_json(const json& j, MyStruct& x) {
     *          x.required_field(j.at("requiredField").get<int>());
     *          x.optional_field(get_opt<std::string>(j, "optionalField"));
     *      }
     * @param parent - Name of the deserialized structure
     * @param childs - Structure attributes data.
     */
    private _createStructDeserializer(parent: string, childs: IStructAttributeSerialData[])
    {
        this._push0(this.serializers, `inline void from_json(const json& j, ${parent}& x) {`);
        childs.forEach(i => {
            if (i.required) {
                this._push1(
                    this.serializers,
                    `x.${i.snakeName} = j.at("${i.origName}").get<${i.typeName}>();`
                );
            }
            else {
                this._push1(
                    this.serializers,
                    `x.${i.snakeName} = get_opt<${i.typeName}>(j, "${i.origName}");`
                );
            }
        });
        this._push0(this.serializers, "}\n");
    }

    /**
     * @description Generates a JSON serializer for a class. The serializer uses getter methods to
     *              access class attributes. Optional fields are checked for existence before
     *              serialization.
     * Ex:
     *      inline void to_json(json& j, const MyClass& x) {
     *          j = json::object();
     *          j["requiredField"] = x.get_required_field();
     *          if (x.get_optional_field()) {
     *              j["optionalField"] = x.get_optional_field();
     *          }
     *      }
     * @param parent - Name of the serialized structure
     * @param childs - Structure attributes data.
     */
    private _createClassSerializer(parent: string, childs: IStructAttributeSerialData[])
    {
        this._push0(this.serializers, `inline void to_json(json& j, const ${parent}& x) {`);
        this._push1(this.serializers, `j = json::object();`);
        childs.forEach(i => {
            if (i.required || this.opt.includeNulls === true) {
                this._push1(this.serializers, `j["${i.origName}"] = x.get_${i.snakeName}();`);
            }
            else {
                this._push1(
                    this.serializers,
                    `set_opt<${i.typeName}>(j, "${i.origName}", x.get_${i.snakeName}());`
                );
            }
        });
        this._push0(this.serializers, "}\n");
    }

    /**
     * @description Generates a JSON deserializer for a class. The deserializer uses setter methods
     *              to populate class attributes.
     * Ex:
     *      inline void from_json(const json& j, MyClass& x) {
     *          x.set_required_field(j.at("requiredField").get<int>());
     *          x.set_optional_field(get_opt<std::string>(j, "optionalField"));
     *      }
     * @param parent - Name of the deserialized structure
     * @param childs - Structure attributes data.
     */
    private _createClassDeserializer(parent: string, childs: IStructAttributeSerialData[])
    {
        this._push0(this.serializers, `inline void from_json(const json& j, ${parent}& x) {`);
        childs.forEach(i => {
            if (i.required) {
                this._push1(
                    this.serializers,
                    `x.set_${i.snakeName}(j.at("${i.origName}").get<${i.typeName}>());`
                );
            }
            else {
                this._push1(
                    this.serializers,
                    `x.set_${i.snakeName}(get_opt<${i.typeName}>(j, "${i.origName}"));`
                );
            }
        });
        this._push0(this.serializers, "}\n");
    }

    /**
     * @description Generates a JSON serializer for an enum. Maps enum values to strings for
     *              serialization, with a default case for unexpected values.
     * Ex:
     *      inline void to_json(json& j, const MyEnum& x) {
     *      switch (x) {
     *          case MyEnum::Value1: j = "VALUE_1"; break;
     *          case MyEnum::Value2: j = "VALUE_2"; break;
     *          default: throw std::runtime_error("Unexpected value serializing enum MyEnum: " +
     *                                              std::to_string(static_cast<int>(x)));
     *      }
     *  }
     * @param parent - Name of the serialized enumerate
     * @param childs - Enumerate values data.
     */
    private _createEnumSerializer(parent: string, childs: IEnumItemSerialData[])
    {
        this.imports.add(LIB.exceptions);

        this._push0(this.serializers, `inline void to_json(json& j, const ${parent}& x) {`);
        this._push1(this.serializers, `switch (x) {`);
        childs.forEach(i => {
            this._push2(
                this.serializers,
                `case ${parent}::${i.enumName}: j = "${i.origValue}"; break;`
            );
        });
        this._push2(
            this.serializers,
            `default: throw std::runtime_error("Unexpected value serializing enum ${parent}: "` +
                ` + std::to_string(static_cast<int>(x)));`
        );
        this._push1(this.serializers, `}`);
        this._push0(this.serializers, `}\n`);
    }

    /**
     * @description Generates a JSON deserializer for an enum. Maps strings to enum values, with an
     *              error for unexpected strings.
     * Ex:
     *      inline void from_json(const json& j, MyEnum& x) {
     *          if (j == "VALUE_1") x = MyEnum::Value1;
     *          else if (j == "VALUE_2") x = MyEnum::Value2;
     *          else {
     *              throw std::runtime_error("Unexpected value deserializing enum MyEnum.");
     *          }
     *      }
     * @param parent - Name of the deserialized enumerate
     * @param childs - Enumerate values data.
     */
    private _createEnumDeserializer(parent: string, childs: IEnumItemSerialData[])
    {
        this.imports.add(LIB.exceptions);

        this._push0(this.serializers, `inline void from_json(const json& j, ${parent}& x) {`);
        childs.forEach((i, index) => {
            if (index === 0) {
                this._push1(
                    this.serializers,
                    `if (j == "${i.origValue}") x = ${parent}::${i.enumName};`
                );
            }
            else {
                this._push1(
                    this.serializers,
                    `else if (j == "${i.origValue}") x = ${parent}::${i.enumName};`
                );
            }
        });
        this._push1(
            this.serializers,
            `else { throw std::runtime_error("Unexpected value deserializing enum ${parent}."); }`
        );
        this._push0(this.serializers, `}\n`);
    }

    // Push with indentation helpers for additional outputs
    private _push0 = (item: string[], data: string) => item.push(`${this.indent[0]}${data}`);
    private _push1 = (item: string[], data: string) => item.push(`${this.indent[1]}${data}`);
    private _push2 = (item: string[], data: string) => item.push(`${this.indent[2]}${data}`);
}
