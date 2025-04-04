#include <iostream>
#include <nlohmann/json.hpp>

using nlohmann::json;

template <typename T>
bool testType(T typeItem, const json& testJson) {
    bool result = false;
    try {
        T deserialized = testJson.get<T>();
        json serialized = deserialized;

        if (testJson == serialized) {
            result = true;
        }
    } catch (const std::exception& e) {
        std::cerr << "C++11 - Error during test: " << e.what() << std::endl;
    }

    return result;
}

json jSupportedSchemas = {
    {"stringItem", "testString"},
    {"literalStringItem", "literalString"},
    {"literalNumberItem", 42},
    {"enumItem", "Enum1"},
    {"nativeEnumItem", 2},
    {"doubleItem", 3.14159},
    {"bigIntItem", 9223372036854775807LL},
    {"int64Item", 123456789LL},
    {"int32Item", 1234},
    {"booleanItem", true},
    {"objectItem", {{"key", "key1"}}},
    {"arrayItem", {{1.1, 2.2}, {3.3, 4.4}}},
    {"recordItem", {{"recordKey", 5.5}}},
    {"mapItem", {{"mapKey", 6.6}}},
    {"setItem", {"setValue1", "setValue2"}},
    {"tupleItem", {42.42, "tupleString", true}},
    {"unionItem", {{"key", "key1"}}},
    {"discriminatedUnionItem", {{"key", "key2"}, {"discriminator", "Enum1"}}},
    {"intersectionItem", {{"key", "key3"}, {"otherKey", "otherKey"}}},
    {"anyItem", {{"anyKey", "anyValue"}}},
    {"optionalItem", "optionalValue"},
    {"nullableItem", nullptr}
};

json jUserDtos = {
    { "createUserUseCaseDto", {
        { "name", "Alice" },
        { "email", "alice@example.com" },
        { "age", 30 },
        { "role", "Admin" }
    }},
    { "createUserUseCaseResultDto", {
        { "id", "101" },
        { "name", "Alice" },
        { "email", "alice@example.com" },
        { "age", 30 },
        { "createdAt", "2025-03-30T14:00:00Z" },
        { "updatedAt", "2025-03-30T15:00:00Z" }
    }}
};