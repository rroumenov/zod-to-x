#include <cxxabi.h>
#include <iostream>
#include <nlohmann/json.hpp>

using nlohmann::json;

template <typename T>
bool testTypeSerialization(
    const std::string testName,
    const char* typeName,
    const T typeItem,
    const json& testJson,
    bool verbose
) {
    bool result = false;
    int status;

    try {
        T deserialized = testJson.get<T>();
        json serialized = deserialized;

        if (verbose) {
            std::cout <<
                abi::__cxa_demangle(typeName, 0, 0, &status) <<
                " - Serialized: " <<
                serialized.dump(2) <<
                std::endl;
        }

        if (testJson == serialized) {
            std::cout <<
                "Test passed: " <<
                testName << 
                " - Serialization and deserialization of " <<
                abi::__cxa_demangle(typeName, 0, 0, &status) <<
                " are equivalent." <<
                std::endl;
            
            result = true;
        } else {
            std::cerr <<
                "Test failed: " <<
                testName << 
                " - Serialization and deserialization of " <<
                abi::__cxa_demangle(typeName, 0, 0, &status) << 
                " are not equivalent." <<
                std::endl;
        }
    } catch (const std::exception& e) {
        std::cerr <<
            "Test error: " <<
            testName << 
            " - " <<
            abi::__cxa_demangle(typeName, 0, 0, &status) << 
            " - Exception: " <<
            e.what() <<
            std::endl;
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
    }},
    { "updateUserUseCaseDto", {
        { "name", "Alice" },
        { "email", "alice@example.com" },
        { "age", 30 },
        { "role", "Admin" }
    }},
    { "updateUserUseCaseResultDto", {
        { "id", "101" },
        { "name", "Alice" },
        { "email", "alice@example.com" },
        { "age", 30 },
        { "role", "Admin" }
    }}
};

json jUserApi = {
    { "reqUpdateUser", {
        { "name", "Alice" },
        { "email", "alice@example.com" },
        { "age", 30 },
        { "role", "Admin" }
    }},
    { "resUpdateUserMulti", {
        { "amount", 19 },
        { "data", {
            {
                { "id", "101" },
                { "name", "Alice" },
                { "email", "alice@example.com" },
                { "age", 30 },
                { "role", "Admin" }
            },
            {
                { "id", "102" },
                { "name", "Bob" },
                { "email", "bob@example.com" },
                { "age", 25 },
                { "role", "User" }
            }
        }}
    }},
    { "resUpdateUser", {
        { "id", "101" },
        { "name", "Alice" },
        { "email", "alice@example.com" },
        { "age", 30 },
        { "role", "Admin" }
    }}
};

json jSupportedSchemasLayeredEntity = {
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
    {"otherObjectItem", {{"otherKey", "otherKey1"}}},
    {"objectItemWithDiscriminator", {{"key", "key2"}, {"discriminator", "Enum1"}}},
    {"otherObjectItemWithDiscriminator", {{"otherKey", "otherKey2"}, {"discriminator", "Enum2"}}},
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

json jSupportedSchemasLayeredApplication = {
    {"newStringItem", "testString"},
    {"newLiteralStringItem", "literalString"},
    {"newLiteralNumberItem", 42},
    {"newEnumItem", "Enum1"},
    {"newNativeEnumItem", 2},
    {"newDoubleItem", 3.14159},
    {"newBigIntItem", 9223372036854775807LL},
    {"newInt64Item", 123456789LL},
    {"newInt32Item", 1234},
    {"newBooleanItem", true},
    {"newObjectItem", {{"key", "key1"}}},
    {"newArrayItem", {{1.1, 2.2}, {3.3, 4.4}}},
    {"newRecordItem", {{"recordKey", 5.5}}},
    {"newMapItem", {{"mapKey", 6.6}}},
    {"newSetItem", {"setValue1", "setValue2"}},
    {"newTupleItem", {42.42, "tupleString", true}},
    {"newUnionItem", {{"key", "key1"}}},
    {"newDiscriminatedUnionItem", {{"key", "key2"}, {"discriminator", "Enum1"}}},
    {"newIntersectionItem", {{"key", "key3"}, {"otherKey", "otherKey"}}},
    {"newAnyItem", {{"anyKey", "anyValue"}}},
    {"newOptionalItem", "optionalValue"},
    {"newNullableItem", nullptr}
};