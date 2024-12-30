import Case from "case";
import { ZodFirstPartyTypeKind } from "zod";

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
    TranspilerableTypes,
    Zod2X,
} from "@/core";
import { INT32_RANGES, UINT32_RANGES } from "@/utils/number_limits";

import { getLibs, USING } from "./libs";
import { getNlohmannOptionalHelper } from "./nlohmann";
import { defaultOpts, IZod2CppOpt } from "./options";

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

/**
 * @description Transpiler for Zod schemas to C++11 code.
 */
export class Zod2Cpp extends Zod2X<IZod2CppOpt> {
    protected serializers: string[];

    protected useBoost: boolean;
    protected lib;

    constructor(opt: IZod2CppOpt = {}) {
        super(
            {
                enableCompositeTypes: false,
            },
            { ...defaultOpts, ...opt }
        );

        this.imports.add("#pragma once\n");

        this.serializers = [];
        this.useBoost = true;
        this.lib = getLibs(this.useBoost);
    }

    protected getIntersectionType = (): string => {
        /** Covered by "transpileIntersection" method */
        return "";
    };

    protected runBefore() {}

    protected runAfter() {
        this.output = this.output.map((i) => `${this.indent[1]}${i}`);

        this.output.unshift(`namespace ${this.opt.namespace} {`);
        this.output.push("}");

        if (this.opt.skipSerialize !== true && this.serializers.length > 0) {
            this.imports.add(this.lib.nlohmann);

            this.output.push("");
            this.output.push(`namespace ${this.opt.namespace} {`);

            if (this.imports.has(this.lib.optional)) {
                this.serializers.unshift(
                    ...getNlohmannOptionalHelper(
                        this.opt.indent as number,
                        this.opt.includeNulls === true,
                        this.useBoost,
                        this.opt.namespace!
                    )
                );
            }

            this.serializers = this.serializers.map((i) => `${this.indent[1]}${i}`);
            this.output.push(...this.serializers);
            this.output.push("}");
        }

        if (this.imports.has(this.lib.nlohmann)) {
            this.imports.add(`\n${USING.nlohmann}`);
        }
    }

    protected getComment = (data: string, indent = ""): string => `${indent}// ${data}`;
    protected getDateType = () => this.getStringType(); // Representing ISO date as a string
    protected getBooleanType = () => "bool";

    protected getStringType = () => {
        this.imports.add(this.lib.string);
        return "std::string";
    };

    /** Ex: std::tuple<TypeA, TypeB, ...> */
    protected getTupleType = (itemsType: string[]) => {
        this.imports.add(this.lib.tuple);
        return `std::tuple<${itemsType.join(", ")}>`;
    };

    protected getAnyType = () => {
        this.imports.add(this.lib.nlohmann);
        return "json";
    };

    /** Ex: std::set<TypeA> */
    protected getSetType = (itemType: string) => {
        this.imports.add(this.lib.set);
        return `std::set<${itemType}>`;
    };

    /** Ex: boost::variant<TypeA, TypeB> */
    protected getUnionType = (itemsType: string[]) => {
        this.imports.add(this.lib.variant);
        return `boost::variant<${itemsType.join(", ")}>`;
    };

    /** Ex: depends on number range (if any). One of:
     *  - std::uint32_t
     *  - std::uint64_t
     *  - std::int32_t
     *  - std::int64_t
     *  - double
     */
    protected getNumberType = (isInt: boolean, range: { min?: number; max?: number }): string => {
        if (!isInt) {
            return "double";
        }

        this.imports.add(this.lib.integers);

        if (range?.min! >= UINT32_RANGES[0]) {
            if (range?.max! <= UINT32_RANGES[1]) {
                return "std::uint32_t";
            } else {
                return "std::uint64_t";
            }
        } else {
            if (range?.max! <= INT32_RANGES[1] && range?.min! >= INT32_RANGES[0]) {
                return "std::int32_t";
            } else {
                return "std::int64_t";
            }
        }
    };

    /** Ex: std::vector<std::vector<TypeA>> */
    protected getArrayType(arrayType: string, arrayDeep: number) {
        this.imports.add(this.lib.vector);

        let output = `std::vector<${arrayType}>`;
        for (let i = 0; i < arrayDeep - 1; i++) {
            output = `std::vector<${output}>`;
        }
        return output;
    }

    protected override getLiteralStringType(
        value: string | number,
        parentEnumNameKey?: [string, string]
    ) {
        return (
            parentEnumNameKey?.[0] ??
            (isNaN(Number(value))
                ? this.getStringType()
                : this.getNumberType(Number.isInteger(value), {
                      min: value as number,
                      max: value as number,
                  }))
        );
    }

    /** Ex: std::unordered_map<TypeA> */
    protected getMapType(keyType: string, valueType: string) {
        this.imports.add(this.lib.map);
        return `std::unordered_map<${keyType}, ${valueType}>`;
    }

    protected getRecordType(keyType: string, valueType: string) {
        return this.getMapType(keyType, valueType);
    }

    protected _getOptional(type: string) {
        this.imports.add(this.lib.optional);
        return `boost::optional<${type}>`;
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

            const separator = index + 1 == data.values.length ? "" : ",";
            this.push1(`${key}${separator}`);

            serializeData.push({ enumName: key, origValue: value });
        });
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
        console.warn(`${data.name}: use zod's merge instead of intersection whenever possible.`);
        console.warn(`${data.name}: no field name conflicts is assumed.`);

        this.addComment(data.description);

        if (
            !(
                data.left.type === "definition" &&
                data.left.referenceType === ZodFirstPartyTypeKind.ZodObject &&
                data.right.type === "definition" &&
                data.right.referenceType === ZodFirstPartyTypeKind.ZodObject
            )
        ) {
            throw new Error(`${data.name}: only intersection of ZodObjects is supported.`);
        }

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

        this._createIntersectionSerializer(data.name, [leftType, rightType]);
        this._createIntersectionDeserializer(data.name, [leftType, rightType]);
    }

    /** Ex: using TypeC = boost::variant<TypeA, TypeB> */
    protected transpileUnion(data: (ASTUnion | ASTDiscriminatedUnion) & ASTCommon) {
        this.addComment(data.description);

        const attributesData = data.options.map((i) => {
            return {
                type: this.getAttributeType(i),
                discriminantValue: (i as ASTCommon & ASTDefintion).discriminantValue,
            };
        });

        const attributesTypes = attributesData.map((i) => i.type);

        this.push0(`using ${data.name} = ${this.getUnionType(attributesTypes)};\n`);

        this._createUnionSerializer(data.name, attributesTypes);
        this._createUnionDeserializer(
            data.name,
            attributesData,
            (data as ASTDiscriminatedUnion).discriminantKey
        );
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
            const origType = this._transpileMember(snakeName, value);
            serializeData.push({
                origName: key,
                snakeName,
                typeName: origType,
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
            const origType = this._transpileMember(snakeName, value);
            setterGetter.push(
                ...this._createSetterGetter(
                    snakeName,
                    origType,
                    !(value.isNullable || value.isOptional)
                )
            );
            serializeData.push({
                origName: key,
                snakeName,
                typeName: origType,
                required: !(value.isNullable || value.isOptional),
            });
        });

        this.push0("");
        this.push0(`public:`);
        this.push1(`${data.name}() = default;`);
        this.push1(`virtual ~${data.name}() = default;`);

        setterGetter.forEach((i) => this.push1(i));

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
     * @returns - The original C++ type of the member, without optional modifier.
     */
    private _transpileMember(memberName: string, memberNode: ASTNode) {
        let keyType = this.getAttributeType(memberNode);
        const origType = keyType;

        if (
            memberNode.description &&
            !(memberNode as ASTDefintion).reference &&
            !this.isTranspilerable(memberNode as TranspilerableTypes)
        ) {
            // Avoid duplicated descriptions for transpiled items.
            this.push1("");
            this.addComment(memberNode.description, `${this.indent[1]}`);
        }

        if (memberNode.isOptional || memberNode.isNullable) {
            keyType = this._getOptional(keyType);
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
    private _createSetterGetter(
        memberName: string,
        memberType: string,
        required?: boolean
    ): string[] {
        const result: string[] = [];

        result.push("");
        if (required) {
            result.push(
                `const ${memberType}& get_${memberName}() const { return this->${memberName}; }`
            );
            result.push(`${memberType}& get_mut_${memberName}() { return this->${memberName}; }`);
            result.push(
                `void set_${memberName}(const ${memberType}& value) { this->${memberName} = value; }`
            );
        } else {
            const fullType = this._getOptional(memberType);
            result.push(`${fullType} get_${memberName}() const { return this->${memberName}; }`);
            result.push(
                `void set_${memberName}(${fullType} value) { this->${memberName} = value; }`
            );
        }

        return result;
    }

    /**
     * @description Generates a JSON serializer for a struct. Each required field is serialized
     *              directly, and optional fields are checked for existence before serialization.
     * Ex:
     *      inline void to_json(json& j, const MyStruct& x) {
     *          j["requiredField"] = x.required_field;
     *          if (x.optional_field) {
     *              j["optionalField"] = x.optional_field;
     *          }
     *      }
     * @param parent - Name of the serialized structure
     * @param childs - Structure attributes data.
     */
    private _createStructSerializer(parent: string, childs: IStructAttributeSerialData[]) {
        this._push0(this.serializers, `inline void to_json(json& j, const ${parent}& x) {`);
        childs.forEach((i) => {
            if (i.required) {
                this._push1(this.serializers, `j["${i.origName}"] = x.${i.snakeName};`);
            } else {
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
    private _createStructDeserializer(parent: string, childs: IStructAttributeSerialData[]) {
        this._push0(this.serializers, `inline void from_json(const json& j, ${parent}& x) {`);
        childs.forEach((i) => {
            if (i.required) {
                this._push1(
                    this.serializers,
                    `x.${i.snakeName} = j.at("${i.origName}").get<${i.typeName}>();`
                );
            } else {
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
     *          j["requiredField"] = x.get_required_field();
     *          if (x.get_optional_field()) {
     *              j["optionalField"] = x.get_optional_field();
     *          }
     *      }
     * @param parent - Name of the serialized structure
     * @param childs - Structure attributes data.
     */
    private _createClassSerializer(parent: string, childs: IStructAttributeSerialData[]) {
        this._push0(this.serializers, `inline void to_json(json& j, const ${parent}& x) {`);
        childs.forEach((i) => {
            if (i.required) {
                this._push1(this.serializers, `j["${i.origName}"] = x.get_${i.snakeName}();`);
            } else {
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
    private _createClassDeserializer(parent: string, childs: IStructAttributeSerialData[]) {
        this._push0(this.serializers, `inline void from_json(const json& j, ${parent}& x) {`);
        childs.forEach((i) => {
            if (i.required) {
                this._push1(
                    this.serializers,
                    `x.set_${i.snakeName}(j.at("${i.origName}").get<${i.typeName}>());`
                );
            } else {
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
    private _createEnumSerializer(parent: string, childs: IEnumItemSerialData[]) {
        this.imports.add(this.lib.exceptions);

        this._push0(this.serializers, `inline void to_json(json& j, const ${parent}& x) {`);
        this._push1(this.serializers, `switch (x) {`);
        childs.forEach((i) => {
            const value = isNaN(Number(i.origValue)) ? `"${i.origValue}"` : i.origValue;
            this._push2(this.serializers, `case ${parent}::${i.enumName}: j = ${value}; break;`);
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
    private _createEnumDeserializer(parent: string, childs: IEnumItemSerialData[]) {
        this.imports.add(this.lib.exceptions);

        this._push0(this.serializers, `inline void from_json(const json& j, ${parent}& x) {`);
        childs.forEach((i, index) => {
            const value = isNaN(Number(i.origValue)) ? `"${i.origValue}"` : i.origValue;

            if (index === 0) {
                this._push1(this.serializers, `if (j == ${value}) x = ${parent}::${i.enumName};`);
            } else {
                this._push1(
                    this.serializers,
                    `else if (j == ${value}) x = ${parent}::${i.enumName};`
                );
            }
        });
        this._push1(
            this.serializers,
            `else { throw std::runtime_error("Unexpected value deserializing enum ${parent}."); }`
        );
        this._push0(this.serializers, `}\n`);
    }

    /**
     * @description Creates a JSON serializer for a class or struct that is the intersection of
     *              multiple types.
     *
     * @example
     * // inline void to_json(json& j, const DerivedType& x) {
     * //     to_json(j, static_cast<const BaseType1&>(x));
     * //     to_json(j, static_cast<const BaseType2&>(x));
     * // }
     *
     * @param intersectName - The name of the intersected class or struct.
     * @param itemsType - An array of strings representing the names of the base types to serialize.
     */
    private _createIntersectionSerializer(intersectName: string, itemsType: string[]) {
        this._push0(this.serializers, `inline void to_json(json& j, const ${intersectName}& x) {`);

        itemsType.forEach((i) =>
            this._push1(this.serializers, `to_json(j, static_cast<const ${i}&>(x));`)
        );

        this._push0(this.serializers, `}\n`);
    }

    /**
     * @description Creates a JSON deserializer for a class or struct that is the intersection of
     *              multiple types.
     *
     * @example
     * // inline void from_json(const json& j, DerivedType& x) {
     * //     from_json(j, static_cast<BaseType1&>(x));
     * //     from_json(j, static_cast<BaseType2&>(x));
     * // }
     *
     * @param intersectName - The name of the intersected class or struct.
     * @param itemsType - An array of strings representing the names of the base types to deserialize.
     */
    private _createIntersectionDeserializer(intersectName: string, itemsType: string[]) {
        this._push0(
            this.serializers,
            `inline void from_json(const json& j, ${intersectName}& x) {`
        );

        itemsType.forEach((i) =>
            this._push1(this.serializers, `from_json(j, static_cast<${i}&>(x));`)
        );

        this._push0(this.serializers, `}\n`);
    }

    /**
     * @description Generates a `to_json` function for a specified union type, allowing the JSON
     *              library to correctly serialize any variant within the union.
     *
     * @param unionName The name of the union type.
     * @param itemsType A list of all variant types contained in the union.
     *
     * @example
     * // Given: unionName = "MyUnion", itemsType = {"int", "std::string"}
     * // The generated output might look like:
     * //
     * // inline void to_json(json& j, const MyUnion& x) {
     * //     if (x.type() == typeid(int)) {
     * //         j = boost::get<int>(x);
     * //     } else if (x.type() == typeid(std::string)) {
     * //         j = boost::get<std::string>(x);
     * //     } else {
     * //         throw std::runtime_error("Unknown MyUnion type.");
     * //     }
     * // }
     */
    protected _createUnionSerializer(unionName: string, itemsType: string[]) {
        this.imports.add(this.lib.exceptions);

        this._push0(this.serializers, `inline void to_json(json& j, const ${unionName}& x) {`);

        itemsType.forEach((i, index) => {
            const condition = index === 0 ? "if" : "else if";
            this._push1(this.serializers, `${condition} (x.type() == typeid(${i})) {`);
            this._push2(this.serializers, `j = boost::get<${i}>(x);`);
            this._push1(this.serializers, `}`);
        });

        this._push1(this.serializers, `else {`);
        this._push2(this.serializers, `throw std::runtime_error("Unknown ${unionName} type.");`);
        this._push1(this.serializers, `}`);

        this._push0(this.serializers, `}\n`);
    }

    /**
     * @description Generates a `from_json` function for a specified union type, attempting to
     *              deserialize the provided JSON into one of the known variant types. If no match
     *              is found, it throws an error.
     *
     * @param unionName The name of the union type.
     * @param items A list of possible variant types. Each item includes:
     *              - `type`: The C++ type for deserialization (e.g., `int`, `std::string`).
     *              - `discriminantValue` (optional): The value in the discriminator field
     *                that maps to the respective type.
     * @param discriminator (optional) The JSON field name that acts as a type discriminator.
     *                      Required for discriminator-based deserialization.
     *
     * @example
     * // Discriminator-based deserialization:
     * // Given: unionName = "MyUnion", discriminator = "type"
     * // items = { {"type": "EmailContact", "discriminantValue": "email"},
     * //           {"type": "PhoneContact", "discriminantValue": "phone"} }
     * //
     * // The generated output might look like:
     * // inline void from_json(const json& j, MyUnion& x) {
     * //     const auto& k = j.at("type").get<std::string>();
     * //     if (k == "email") {
     * //         x = j.get<EmailContact>();
     * //     } else if (k == "phone") {
     * //         x = j.get<PhoneContact>();
     * //     } else {
     * //         throw std::runtime_error("Failed to deserialize MyUnion: unknown type");
     * //     }
     * // }
     *
     * @example
     * // Fallback matching without a discriminator:
     * // Given: unionName = "MyUnion", items = { {"type": "int"}, {"type": "std::string"} }
     * //
     * // The generated output might look like:
     * // inline void from_json(const json& j, MyUnion& x) {
     * //     try {
     * //         // Try to deserialize as int
     * //         x = j.get<int>();
     * //         return;
     * //     } catch (const std::exception&) {
     * //         // Fall through to try the next type
     * //     }
     * //
     * //     try {
     * //         // Try to deserialize as std::string
     * //         x = j.get<std::string>();
     * //         return;
     * //     } catch (const std::exception&) {
     * //         // None of the types matched. Error
     * //         throw std::runtime_error("Failed to deserialize MyUnion: unknown format");
     * //     }
     * // }
     */
    private _createUnionDeserializer(
        unionName: string,
        items: Array<{ type: string; discriminantValue?: string }>,
        discriminator?: string
    ) {
        this.imports.add(this.lib.exceptions);

        this._push0(this.serializers, `inline void from_json(const json& j, ${unionName}& x) {`);

        const useDiscriminator = discriminator && items.every((i) => i.discriminantValue);

        if (useDiscriminator) {
            this._push1(
                this.serializers,
                `const auto& k = j.at("${discriminator}").get<std::string>();`
            );

            items.forEach((i, index) => {
                const condition = index === 0 ? "if" : "else if";
                this._push1(this.serializers, `${condition} (k == "${i.discriminantValue}") {`);
                this._push2(this.serializers, `x = j.get<${i.type}>();`);
                this._push1(this.serializers, `}`);

                if (index == items.length - 1) {
                    this._push1(this.serializers, `else {`);
                    this._push2(
                        this.serializers,
                        this.getComment(`None of the types matched. Error`)
                    );
                    this._push2(
                        this.serializers,
                        `throw std::runtime_error("Failed to deserialize ${unionName}: unknown format");`
                    );
                    this._push1(this.serializers, `}`);
                }
            });
        } else {
            console.warn(
                `${unionName}: use ZodDiscriminatedUnion instead of ZodUnion whenever possible.`
            );

            items.forEach((i, index) => {
                this._push1(this.serializers, `try {`);
                this._push2(this.serializers, this.getComment(`Try to deserialize as ${i.type}`));
                this._push2(this.serializers, `x = j.get<${i.type}>();`);
                this._push2(this.serializers, `return;`);
                this._push1(this.serializers, `} catch (const std::exception&) {`);

                if (index != items.length - 1) {
                    this._push2(
                        this.serializers,
                        this.getComment(`Fall through to try the next type`)
                    );
                } else {
                    this._push2(
                        this.serializers,
                        this.getComment(`None of the types matched. Error`)
                    );
                    this._push2(
                        this.serializers,
                        `throw std::runtime_error("Failed to deserialize ${unionName}: unknown format");`
                    );
                }

                this._push1(this.serializers, `}`);
            });
        }

        this._push0(this.serializers, `}\n`);
    }

    // Push with indentation helpers for additional outputs
    protected _push0 = (item: string[], data: string) => item.push(`${this.indent[0]}${data}`);
    protected _push1 = (item: string[], data: string) => item.push(`${this.indent[1]}${data}`);
    protected _push2 = (item: string[], data: string) => item.push(`${this.indent[2]}${data}`);
    protected _push3 = (item: string[], data: string) => item.push(`${this.indent[3]}${data}`);
    protected _push4 = (item: string[], data: string) => item.push(`${this.indent[4]}${data}`);
}

/**
 * @description Transpiler for Zod schemas to C++17 code.
 */
export class Zod2Cpp17 extends Zod2Cpp {
    constructor(opt: IZod2CppOpt = {}) {
        super(opt);

        this.useBoost = false;
        this.lib = getLibs(this.useBoost);
    }

    /** Ex: std::variant<TypeA, TypeB> */
    protected override getUnionType = (itemsType: string[]) => {
        this.imports.add(this.lib.variant);
        return `std::variant<${itemsType.join(", ")}>`;
    };

    protected override _getOptional(type: string) {
        this.imports.add(this.lib.optional);
        return `std::optional<${type}>`;
    }

    /**
     * @description Generates a `to_json` function for a specified union type, allowing the JSON
     *              library to correctly serialize any variant within the union.
     *
     * @param unionName The name of the union type.
     * @param itemsType A list of all variant types contained in the union.
     *
     * @example
     * // Given: unionName = "MyUnion", itemsType = {"int", "std::string"}
     * // The generated output might look like:
     * //
     * // inline void to_json(json& j, const MyUnion& x) {
     * //     std::visit(
     * //         [&j](auto&& arg) {
     * //             using T = std::decay_t<decltype(arg)>;
     * //             if constexpr (std::is_same_v<T, int>) {
     * //                 j = arg;
     * //             } else if constexpr (std::is_same_v<T, std::string>) {
     * //                 j = arg;
     * //             } else {
     * //                 throw std::runtime_error("Unknown MyUnion type.");
     * //             }
     * //         },
     * //         x
     * //     );
     * // }
     */
    protected override _createUnionSerializer(unionName: string, itemsType: string[]) {
        this.imports.add(this.lib.exceptions);

        this._push0(this.serializers, `inline void to_json(json& j, const ${unionName}& x) {`);
        this._push1(this.serializers, `std::visit(`);
        this._push2(this.serializers, `[&j](auto&& arg) {`);
        this._push3(this.serializers, `using T = std::decay_t<decltype(arg)>;`);

        itemsType.forEach((i, index) => {
            const condition = (index === 0 ? "if" : "else if") + " constexpr";
            this._push3(this.serializers, `${condition} (std::is_same_v<T, ${i}>) {`);
            this._push4(this.serializers, `j = arg;`);
            this._push3(this.serializers, `}`);
        });

        this._push3(this.serializers, `else {`);
        this._push4(this.serializers, `throw std::runtime_error("Unknown ${unionName} type.");`);
        this._push3(this.serializers, `}`);

        this._push2(this.serializers, `},`);
        this._push2(this.serializers, `x`);
        this._push1(this.serializers, `);`);
        this._push0(this.serializers, `}\n`);
    }
}
