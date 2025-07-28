import { z } from "zod/v4";
import { Zod2XTypes, extendZod, Zod2Ast, Zod2XTranspilers } from "../../../dist";
extendZod(z);

import { describe, test, beforeAll, vi } from "vitest";
import * as fs from "fs";

import { zCppSupportedSchemas } from "../cpp_supported_schemas";
import { header } from "../../common/header";
import { userApi, userDtos, userModels } from "../../common/layered_schemas";
import { testOutput } from "../../common/utils";
import { getSchemas, modelBuilder } from "../../common/zod_schemas";
import { userDtos as userDtosMixin } from "../../common/layered_mixin_schemas";
import {
    cppSupportedSchemasApplicationModel,
    cppSupportedSchemasModel,
} from "../cpp_supported_schemas.layered";

const schemas = getSchemas();

let cppSupportedSchemas: Zod2XTypes.ASTNodes;

describe("Zod2Cpp17", () => {
    beforeAll(() => {
        vi.spyOn(console, "warn").mockImplementation(vi.fn());
        cppSupportedSchemas = new Zod2Ast({ strict: false }).build(zCppSupportedSchemas);
    });

    test("String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zString));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <string>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::string item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::string>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Literal String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zLiteralString));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <string>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::string item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::string>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Literal Number Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zLiteralNumber));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <cstdint>\n" +
            "#include <nlohmann/json.hpp>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::uint32_t item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::uint32_t>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zEnum));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <stdexcept>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  enum class EnumItem: int {\n" +
            "    Enum1,\n" +
            "    Enum2,\n" +
            "    Enum3\n" +
            "  };\n\n" +
            "  struct ModelItem {\n" +
            "    EnumItem item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const EnumItem& x) {\n" +
            "    switch (x) {\n" +
            '      case EnumItem::Enum1: j = "Enum1"; break;\n' +
            '      case EnumItem::Enum2: j = "Enum2"; break;\n' +
            '      case EnumItem::Enum3: j = "Enum3"; break;\n' +
            '      default: throw std::runtime_error("Unexpected value serializing enum EnumItem: " + std::to_string(static_cast<int>(x)));\n' +
            "    }\n" +
            "  }\n\n" +
            "  inline void from_json(const json& j, EnumItem& x) {\n" +
            '    if (j == "Enum1") x = EnumItem::Enum1;\n' +
            '    else if (j == "Enum2") x = EnumItem::Enum2;\n' +
            '    else if (j == "Enum3") x = EnumItem::Enum3;\n' +
            '    else { throw std::runtime_error("Unexpected value deserializing enum EnumItem."); }\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<EnumItem>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Native Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zNativeEnum));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <stdexcept>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  enum class NativeEnumItem: int {\n" +
            "    NativeEnum1,\n" +
            "    NativeEnum2,\n" +
            "    NativeEnum3\n" +
            "  };\n\n" +
            "  struct ModelItem {\n" +
            "    NativeEnumItem item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const NativeEnumItem& x) {\n" +
            "    switch (x) {\n" +
            "      case NativeEnumItem::NativeEnum1: j = 1; break;\n" +
            "      case NativeEnumItem::NativeEnum2: j = 2; break;\n" +
            '      case NativeEnumItem::NativeEnum3: j = "NativeEnum3"; break;\n' +
            '      default: throw std::runtime_error("Unexpected value serializing enum NativeEnumItem: " + std::to_string(static_cast<int>(x)));\n' +
            "    }\n" +
            "  }\n\n" +
            "  inline void from_json(const json& j, NativeEnumItem& x) {\n" +
            "    if (j == 1) x = NativeEnumItem::NativeEnum1;\n" +
            "    else if (j == 2) x = NativeEnumItem::NativeEnum2;\n" +
            '    else if (j == "NativeEnum3") x = NativeEnumItem::NativeEnum3;\n' +
            '    else { throw std::runtime_error("Unexpected value deserializing enum NativeEnumItem."); }\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<NativeEnumItem>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Double", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDouble));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    double item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<double>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as BigInt", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zBigInt));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <cstdint>\n" +
            "#include <nlohmann/json.hpp>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::int64_t item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::int64_t>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Int64", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zInt64));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <cstdint>\n" +
            "#include <nlohmann/json.hpp>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::int64_t item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::int64_t>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Int32", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zInt32));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <cstdint>\n" +
            "#include <nlohmann/json.hpp>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::int32_t item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::int32_t>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Boolean Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zBoolean));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    bool item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<bool>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Object Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zObject));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <string>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ObjectItem {\n" +
            "    std::string key;\n" +
            "  };\n\n" +
            "  struct ModelItem {\n" +
            "    ObjectItem item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ObjectItem& x) {\n" +
            '    j["key"] = x.key;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ObjectItem& x) {\n" +
            '    x.key = j.at("key").get<std::string>();\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<ObjectItem>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Record Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zRecord));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <string>\n" +
            "#include <unordered_map>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::unordered_map<std::string, double> item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::unordered_map<std::string, double>>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zMap));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <string>\n" +
            "#include <unordered_map>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::unordered_map<std::string, double> item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::unordered_map<std::string, double>>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zSet));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <set>\n" +
            "#include <string>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::set<std::string> item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::set<std::string>>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Tuple Multi-type Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zTupleMulti));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <string>\n" +
            "#include <tuple>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::tuple<double, std::string, bool> item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<std::tuple<double, std::string, bool>>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Union Schema - without Composite Types", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zUnion));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <stdexcept>\n" +
            "#include <string>\n" +
            "#include <variant>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ObjectItem {\n" +
            "    std::string key;\n" +
            "  };\n\n" +
            "  struct OtherObjectItem {\n" +
            "    std::string other_key;\n" +
            "  };\n\n" +
            "  using UnionItem = std::variant<\n" +
            "    ObjectItem,\n" +
            "    OtherObjectItem\n" +
            "  >;\n\n" +
            "  struct ModelItem {\n" +
            "    UnionItem item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ObjectItem& x) {\n" +
            '    j["key"] = x.key;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ObjectItem& x) {\n" +
            '    x.key = j.at("key").get<std::string>();\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const OtherObjectItem& x) {\n" +
            '    j["otherKey"] = x.other_key;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, OtherObjectItem& x) {\n" +
            '    x.other_key = j.at("otherKey").get<std::string>();\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const UnionItem& x) {\n" +
            "    std::visit(\n" +
            "      [&j](auto&& arg) {\n" +
            "        using T = std::decay_t<decltype(arg)>;\n" +
            "        if constexpr (std::is_same_v<T, ObjectItem>) {\n" +
            "          j = arg;\n" +
            "        }\n" +
            "        else if constexpr (std::is_same_v<T, OtherObjectItem>) {\n" +
            "          j = arg;\n" +
            "        }\n" +
            "        else {\n" +
            '          throw std::runtime_error("Unknown UnionItem type.");\n' +
            "        }\n" +
            "      },\n" +
            "      x\n" +
            "    );\n" +
            "  }\n\n" +
            "  inline void from_json(const json& j, UnionItem& x) {\n" +
            "    try {\n" +
            "      // Try to deserialize as ObjectItem\n" +
            "      x = j.get<ObjectItem>();\n" +
            "      return;\n" +
            "    } catch (const std::exception&) {\n" +
            "      // Fall through to try the next type\n" +
            "    }\n" +
            "    try {\n" +
            "      // Try to deserialize as OtherObjectItem\n" +
            "      x = j.get<OtherObjectItem>();\n" +
            "      return;\n" +
            "    } catch (const std::exception&) {\n" +
            "      // None of the types matched. Error\n" +
            '      throw std::runtime_error("Failed to deserialize UnionItem: unknown format");\n' +
            "    }\n" +
            "  }\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<UnionItem>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Discriminant Union Schema - without Composite Types", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDiscriminantUnion));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <stdexcept>\n" +
            "#include <string>\n" +
            "#include <variant>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  enum class EnumItem: int {\n" +
            "    Enum1,\n" +
            "    Enum2,\n" +
            "    Enum3\n" +
            "  };\n\n" +
            "  struct ObjectItemWithDiscriminator {\n" +
            "    std::string key;\n" +
            "    EnumItem discriminator;\n" +
            "  };\n\n" +
            "  struct OtherObjectItemWithDiscriminator {\n" +
            "    std::string other_key;\n" +
            "    EnumItem discriminator;\n" +
            "  };\n\n" +
            "  using DiscriminatedUnionItem = std::variant<\n" +
            "    ObjectItemWithDiscriminator,\n" +
            "    OtherObjectItemWithDiscriminator\n" +
            "  >;\n\n" +
            "  struct ModelItem {\n" +
            "    DiscriminatedUnionItem item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const EnumItem& x) {\n" +
            "    switch (x) {\n" +
            '      case EnumItem::Enum1: j = "Enum1"; break;\n' +
            '      case EnumItem::Enum2: j = "Enum2"; break;\n' +
            '      case EnumItem::Enum3: j = "Enum3"; break;\n' +
            '      default: throw std::runtime_error("Unexpected value serializing enum EnumItem: " + std::to_string(static_cast<int>(x)));\n' +
            "    }\n" +
            "  }\n\n" +
            "  inline void from_json(const json& j, EnumItem& x) {\n" +
            '    if (j == "Enum1") x = EnumItem::Enum1;\n' +
            '    else if (j == "Enum2") x = EnumItem::Enum2;\n' +
            '    else if (j == "Enum3") x = EnumItem::Enum3;\n' +
            '    else { throw std::runtime_error("Unexpected value deserializing enum EnumItem."); }\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const ObjectItemWithDiscriminator& x) {\n" +
            '    j["key"] = x.key;\n' +
            '    j["discriminator"] = x.discriminator;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ObjectItemWithDiscriminator& x) {\n" +
            '    x.key = j.at("key").get<std::string>();\n' +
            '    x.discriminator = j.at("discriminator").get<EnumItem>();\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const OtherObjectItemWithDiscriminator& x) {\n" +
            '    j["otherKey"] = x.other_key;\n' +
            '    j["discriminator"] = x.discriminator;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, OtherObjectItemWithDiscriminator& x) {\n" +
            '    x.other_key = j.at("otherKey").get<std::string>();\n' +
            '    x.discriminator = j.at("discriminator").get<EnumItem>();\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const DiscriminatedUnionItem& x) {\n" +
            "    std::visit(\n" +
            "      [&j](auto&& arg) {\n" +
            "        using T = std::decay_t<decltype(arg)>;\n" +
            "        if constexpr (std::is_same_v<T, ObjectItemWithDiscriminator>) {\n" +
            "          j = arg;\n" +
            "        }\n" +
            "        else if constexpr (std::is_same_v<T, OtherObjectItemWithDiscriminator>) {\n" +
            "          j = arg;\n" +
            "        }\n" +
            "        else {\n" +
            '          throw std::runtime_error("Unknown DiscriminatedUnionItem type.");\n' +
            "        }\n" +
            "      },\n" +
            "      x\n" +
            "    );\n" +
            "  }\n\n" +
            "  inline void from_json(const json& j, DiscriminatedUnionItem& x) {\n" +
            '    const auto& k = j.at("discriminator").get<std::string>();\n' +
            '    if (k == "Enum1") {\n' +
            "      x = j.get<ObjectItemWithDiscriminator>();\n" +
            "    }\n" +
            '    else if (k == "Enum2") {\n' +
            "      x = j.get<OtherObjectItemWithDiscriminator>();\n" +
            "    }\n" +
            "    else {\n" +
            "      // None of the types matched. Error\n" +
            '      throw std::runtime_error("Failed to deserialize DiscriminatedUnionItem: unknown format");\n' +
            "    }\n" +
            "  }\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<DiscriminatedUnionItem>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Intersection Schema - without Composite Types", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zIntersection));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <string>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ObjectItem {\n" +
            "    std::string key;\n" +
            "  };\n\n" +
            "  struct OtherObjectItem {\n" +
            "    std::string other_key;\n" +
            "  };\n\n" +
            "  struct IntersectionItem : public ObjectItem, public OtherObjectItem {\n" +
            "    // Intersection fields are inherited from base structs.\n" +
            "  };\n\n" +
            "  struct ModelItem {\n" +
            "    IntersectionItem item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ObjectItem& x) {\n" +
            '    j["key"] = x.key;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ObjectItem& x) {\n" +
            '    x.key = j.at("key").get<std::string>();\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const OtherObjectItem& x) {\n" +
            '    j["otherKey"] = x.other_key;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, OtherObjectItem& x) {\n" +
            '    x.other_key = j.at("otherKey").get<std::string>();\n' +
            "  }\n\n" +
            "  inline void to_json(json& j, const IntersectionItem& x) {\n" +
            "    to_json(j, static_cast<const ObjectItem&>(x));\n" +
            "    to_json(j, static_cast<const OtherObjectItem&>(x));\n" +
            "  }\n\n" +
            "  inline void from_json(const json& j, IntersectionItem& x) {\n" +
            "    from_json(j, static_cast<ObjectItem&>(x));\n" +
            "    from_json(j, static_cast<OtherObjectItem&>(x));\n" +
            "  }\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<IntersectionItem>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Any Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zAny));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    json item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    j["item"] = x.item;\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = j.at("item").get<json>();\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Optional Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zOptional));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <optional>\n" +
            "#include <string>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::optional<std::string> item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  #ifndef NLOHMANN_OPTIONAL_HELPER_zodtocpp\n" +
            "  #define NLOHMANN_OPTIONAL_HELPER_zodtocpp\n" +
            "  template <typename T>\n" +
            "  std::optional<T> get_opt(const json& j, const std::string& key) {\n" +
            "    auto it = j.find(key);\n" +
            "    if (it != j.end() && !it->is_null()) {\n" +
            "      return it->get<T>();\n" +
            "    }\n" +
            "    return std::optional<T>();\n" +
            "  }\n\n" +
            "  template <typename T>\n" +
            "  void set_opt(json& j, const std::string& key, const std::optional<T>& opt) {\n" +
            "    if (opt) {\n" +
            "      j[key] = *opt;\n" +
            "    }\n" +
            "  }\n" +
            "  #endif\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    set_opt<std::string>(j, "item", x.item);\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = get_opt<std::string>(j, "item");\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Nullable Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zNullable));
        const output = new Zod2XTranspilers.Zod2Cpp17({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "#pragma once\n\n" +
            "#include <nlohmann/json.hpp>\n" +
            "#include <optional>\n" +
            "#include <string>\n\n" +
            "using nlohmann::json;\n\n" +
            "namespace zodtocpp {\n" +
            "  struct ModelItem {\n" +
            "    std::optional<std::string> item;\n" +
            "  };\n\n" +
            "}\n\n" +
            "namespace zodtocpp {\n" +
            "  #ifndef NLOHMANN_OPTIONAL_HELPER_zodtocpp\n" +
            "  #define NLOHMANN_OPTIONAL_HELPER_zodtocpp\n" +
            "  template <typename T>\n" +
            "  std::optional<T> get_opt(const json& j, const std::string& key) {\n" +
            "    auto it = j.find(key);\n" +
            "    if (it != j.end() && !it->is_null()) {\n" +
            "      return it->get<T>();\n" +
            "    }\n" +
            "    return std::optional<T>();\n" +
            "  }\n\n" +
            "  template <typename T>\n" +
            "  void set_opt(json& j, const std::string& key, const std::optional<T>& opt) {\n" +
            "    if (opt) {\n" +
            "      j[key] = *opt;\n" +
            "    }\n" +
            "  }\n" +
            "  #endif\n\n" +
            "  inline void to_json(json& j, const ModelItem& x) {\n" +
            '    set_opt<std::string>(j, "item", x.item);\n' +
            "  }\n\n" +
            "  inline void from_json(const json& j, ModelItem& x) {\n" +
            '    x.item = get_opt<std::string>(j, "item");\n' +
            "  }\n\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("C++ supported schemas - as class", () => {
        const output = new Zod2XTranspilers.Zod2Cpp17({
            outType: "class",
            header,
            includeNulls: true,
            namespace: "zodtocppclass",
        }).transpile(cppSupportedSchemas);
        const expectedOutput = fs
            .readFileSync(
                "./test/test_zod2cpp/cpp17/class-expected/cpp_supported_schemas.expect17.class.hpp"
            )
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/class-expected/err-cpp_supported_schemas.expect17.class.hpp"
        );
    });

    test("C++ supported schemas - as struct", () => {
        const output = new Zod2XTranspilers.Zod2Cpp17({
            outType: "struct",
            header,
            includeNulls: true,
            namespace: "zodtocppstruct",
        }).transpile(cppSupportedSchemas);
        const expectedOutput = fs
            .readFileSync(
                "./test/test_zod2cpp/cpp17/struct-expected/cpp_supported_schemas.expect17.struct.hpp"
            )
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/struct-expected/err-cpp_supported_schemas.expect17.struct.hpp"
        );
    });

    test("C++ layered modeling - domain", () => {
        const output = userModels.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "struct",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/struct-expected/user.entity.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/struct-expected/err-user.entity.hpp"
        );
    });

    test("C++ layered modeling - application", () => {
        const output = userDtos.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "struct",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/struct-expected/user.dtos.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/struct-expected/err-user.dtos.hpp"
        );
    });

    test("C++ layered modeling - infrastructure", () => {
        const output = userApi.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "struct",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/struct-expected/user.api.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/struct-expected/err-user.api.hpp"
        );
    });

    test("C++ layered modeling - domain as class", () => {
        const output = userModels.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "class",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/class-expected/user.entity.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/class-expected/err-user.entity.hpp"
        );
    });

    test("C++ layered modeling - application as class", () => {
        const output = userDtos.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "class",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/class-expected/user.dtos.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/class-expected/err-user.dtos.hpp"
        );
    });

    test("C++ layered modeling - infrastructure as class", () => {
        const output = userApi.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "class",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/class-expected/user.api.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/class-expected/err-user.api.hpp"
        );
    });

    test("C++ layered modeling mixin- application", () => {
        const output = userDtosMixin.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "struct",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/struct-expected/user.dtos.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/struct-expected/err-user.dtos.hpp"
        );
    });

    test("C++ layered modeling mixin - application as class", () => {
        const output = userDtosMixin.transpile(Zod2XTranspilers.Zod2Cpp17, {
            outType: "class",
            header,
            includeNulls: true,
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/class-expected/user.dtos.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/class-expected/err-user.dtos.hpp"
        );
    });

    test("C++ supported schemas layered modeling - entity", () => {
        const output = cppSupportedSchemasModel.transpile(
            Zod2XTranspilers.Zod2Cpp17,
            {
                outType: "struct",
                header,
                includeNulls: true,
            },
            {
                strict: false,
            }
        );
        const expectedOutput = fs
            .readFileSync(
                "./test/test_zod2cpp/cpp17/struct-expected/cpp_supported_schemas.entity.hpp"
            )
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/struct-expected/err-cpp_supported_schemas.entity.hpp"
        );
    });

    test("C++ supported schemas layered modeling - application", () => {
        const output = cppSupportedSchemasApplicationModel.transpile(
            Zod2XTranspilers.Zod2Cpp17,
            {
                outType: "struct",
                header,
                includeNulls: true,
            },
            {
                strict: false,
            }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/struct-expected/cpp_supported_schemas.app.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/struct-expected/err-cpp_supported_schemas.app.hpp"
        );
    });

    test("C++ supported schemas layered modeling - entity as class", () => {
        const output = cppSupportedSchemasModel.transpile(
            Zod2XTranspilers.Zod2Cpp17,
            {
                outType: "class",
                header,
                includeNulls: true,
            },
            {
                strict: false,
            }
        );
        const expectedOutput = fs
            .readFileSync(
                "./test/test_zod2cpp/cpp17/class-expected/cpp_supported_schemas.entity.hpp"
            )
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/class-expected/err-cpp_supported_schemas.entity.hpp"
        );
    });

    test("C++ supported schemas layered modeling - application as class", () => {
        const output = cppSupportedSchemasApplicationModel.transpile(
            Zod2XTranspilers.Zod2Cpp17,
            {
                outType: "class",
                header,
                includeNulls: true,
            },
            {
                strict: false,
            }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2cpp/cpp17/class-expected/cpp_supported_schemas.app.hpp")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2cpp/cpp17/class-expected/err-cpp_supported_schemas.app.hpp"
        );
    });
});
