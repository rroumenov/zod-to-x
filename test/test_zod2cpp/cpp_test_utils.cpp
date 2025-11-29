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

// Test data for layered generics
json jGenericUserEntities = {
    {"normalUserEntity", {
        {"id", "user_001"},
        {"name", "John Doe"},
        {"email", "john@example.com"},
        {"age", 30},
        {"metadata", {
            {"favoriteColor", "blue"},
            {"hobbies", {"reading", "coding", "gaming"}}
        }}
    }},
    {"adminUserEntity", {
        {"id", "admin_001"},
        {"name", "Jane Smith"},
        {"email", "jane@admin.com"},
        {"age", 35},
        {"metadata", {
            {"adminLevel", 5},
            {"permissions", {"read", "write", "delete", "admin"}}
        }}
    }}
};

// Infrastructure types for struct version (using double for success)
json jInfrastructureTypesStruct = {
    {"httpSuccessfulResponse", {
        {"success", true},
        {"data", {
            {"id", "dto_001"},
            {"name", "Test Result"},
            {"age", 25}
        }}
    }},
    {"httpUnsuccessfulResponse", {
        {"success", false},
        {"message", "Operation failed"},
        {"details", {
            {"errorCode", "ERR_001"},
            {"timestamp", "2025-11-29T10:00:00Z"}
        }}
    }},
    {"objectWithGeneric", {
        {"internal", {
            {"success", true},
            {"data", {
                {"id", "internal_001"},
                {"name", "Internal Data"},
                {"age", 28}
            }}
        }},
        {"item", {
            {"success", true},
            {"data", {
                {"id", "item_001"},
                {"name", "Item Data"},
                {"age", 32}
            }}
        }},
        {"userItem", {
            {"id", "user_002"},
            {"name", "User Item"},
            {"email", "user@item.com"},
            {"age", 27},
            {"metadata", {
                {"id", "meta_001"},
                {"name", "Meta Data"},
                {"age", 20}
            }}
        }},
        {"otherUserItem", {
            {"id", "admin_002"},
            {"name", "Admin Item"},
            {"email", "admin@item.com"},
            {"age", 40},
            {"metadata", {
                {"adminLevel", 3},
                {"permissions", {"read", "write"}}
            }}
        }}
    }},
    {"dataRetrieve", {
        {"success", true},
        {"data", {
            {"id", "retrieve_001"},
            {"name", "Retrieved Data"},
            {"age", 29}
        }}
    }},
    {"userRetrieve", {
        {"success", true},
        {"data", {
            {"id", "normal_001"},
            {"name", "Normal User"},
            {"email", "normal@user.com"},
            {"age", 26},
            {"metadata", {
                {"favoriteColor", "green"},
                {"hobbies", {"swimming", "running"}}
            }}
        }}
    }},
    {"intersectedDataRetrieve", {
        {"success", true},
        {"data", {
            {"id", "intersect_data_001"},
            {"name", "Intersect Data"},
            {"age", 31}
        }},
        {"id", "intersect_user_001"},
        {"name", "Intersect User"},
        {"email", "intersect@user.com"},
        {"age", 33},
        {"metadata", {
            {"code", "CODE_001"},
            {"description", "Intersection metadata"}
        }}
    }}
};

// Infrastructure types for class version (using bool for success)
json jInfrastructureTypesClass = {
    {"httpSuccessfulResponse", {
        {"success", true},
        {"data", {
            {"id", "dto_001"},
            {"name", "Test Result"},
            {"age", 25}
        }}
    }},
    {"httpUnsuccessfulResponse", {
        {"success", false},
        {"message", "Operation failed"},
        {"details", {
            {"errorCode", "ERR_001"},
            {"timestamp", "2025-11-29T10:00:00Z"}
        }}
    }},
    {"objectWithGeneric", {
        {"internal", {
            {"success", true},
            {"data", {
                {"id", "internal_001"},
                {"name", "Internal Data"},
                {"age", 28}
            }}
        }},
        {"item", {
            {"success", true},
            {"data", {
                {"id", "item_001"},
                {"name", "Item Data"},
                {"age", 32}
            }}
        }},
        {"userItem", {
            {"id", "user_002"},
            {"name", "User Item"},
            {"email", "user@item.com"},
            {"age", 27},
            {"metadata", {
                {"id", "meta_001"},
                {"name", "Meta Data"},
                {"age", 20}
            }}
        }},
        {"otherUserItem", {
            {"id", "admin_002"},
            {"name", "Admin Item"},
            {"email", "admin@item.com"},
            {"age", 40},
            {"metadata", {
                {"adminLevel", 3},
                {"permissions", {"read", "write"}}
            }}
        }}
    }},
    {"dataRetrieve", {
        {"success", true},
        {"data", {
            {"id", "retrieve_001"},
            {"name", "Retrieved Data"},
            {"age", 29}
        }}
    }},
    {"userRetrieve", {
        {"success", true},
        {"data", {
            {"id", "normal_001"},
            {"name", "Normal User"},
            {"email", "normal@user.com"},
            {"age", 26},
            {"metadata", {
                {"favoriteColor", "green"},
                {"hobbies", {"swimming", "running"}}
            }}
        }}
    }},
    {"intersectedDataRetrieve", {
        {"success", true},
        {"data", {
            {"id", "intersect_data_001"},
            {"name", "Intersect Data"},
            {"age", 31}
        }},
        {"id", "intersect_user_001"},
        {"name", "Intersect User"},
        {"email", "intersect@user.com"},
        {"age", 33},
        {"metadata", {
            {"code", "CODE_001"},
            {"description", "Intersection metadata"}
        }}
    }}
};