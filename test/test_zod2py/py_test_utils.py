from datetime import datetime

# Equivalent to jSupportedSchemas in cpp_test_utils.cpp
j_supported_schemas = {
    "stringItem": "testString",
    "literalStringItem": "literal",
    "literalNumberItem": 1,
    "enumItem": "Enum1",
    "nativeEnumItem": 2,
    "doubleItem": 3.14159,
    "bigIntItem": 9223372036854775807,
    "int64Item": 123456789,
    "int32Item": 1234,
    "booleanItem": True,
    "objectItem": {"key": "key1"},
    "dateItem": "2025-03-30T14:00:00",
    "arrayItem": [[1.1, 2.2], [3.3, 4.4]],
    "recordItem": {"recordKey": 5.5},
    "mapItem": {"mapKey": 6.6},
    "setItem": ["setValue1", "setValue2"],
    "tupleItem": [42.42, "tupleString", True],
    "unionItem": {"key": "key1"},
    "discriminatedUnionItem": {"key": "key2", "discriminator": "Enum1"},
    "intersectionItem": {"key": "key3", "otherKey": "otherKey"},
    "anyItem": {"anyKey": "anyValue"},
    "optionalItem": "optionalValue",
    "nullableItem": None,
}

j_object_item = {"key": "key1"}

j_other_object_item = {"otherKey": "otherKey1"}

j_object_item_with_discriminator = {"key": "key2", "discriminator": "Enum1"}

j_other_object_item_with_discriminator = {"otherKey": "otherKey2", "discriminator": "Enum2"}

j_intersection_item = {"key": "key3", "otherKey": "otherKey"}

# Union test cases
j_union_item_object = {"key": "key1"}
j_union_item_other_object = {"otherKey": "otherKey1"}

# Discriminated union test cases
j_discriminated_union_enum1 = {"key": "key2", "discriminator": "Enum1"}
j_discriminated_union_enum2 = {"otherKey": "otherKey2", "discriminator": "Enum2"}


# Layered entity test data (entity layer)
j_supported_schemas_layered_entity = {
    "stringItem": "testString",
    "literalStringItem": "literal",
    "literalNumberItem": 1,
    "enumItem": "Enum1",
    "nativeEnumItem": 2,
    "doubleItem": 3.14159,
    "bigIntItem": 9223372036854775807,
    "int64Item": 123456789,
    "int32Item": 1234,
    "booleanItem": True,
    "objectItem": {"key": "key1"},
    "otherObjectItem": {"otherKey": "otherKey1"},
    "objectItemWithDiscriminator": {"key": "key2", "discriminator": "Enum1"},
    "otherObjectItemWithDiscriminator": {"otherKey": "otherKey2", "discriminator": "Enum2"},
    "dateItem": "2025-03-30T14:00:00",
    "arrayItem": [[1.1, 2.2], [3.3, 4.4]],
    "recordItem": {"recordKey": 5.5},
    "mapItem": {"mapKey": 6.6},
    "setItem": ["setValue1", "setValue2"],
    "tupleItem": [42.42, "tupleString", True],
    "unionItem": {"key": "key1"},
    "discriminatedUnionItem": {"key": "key2", "discriminator": "Enum1"},
    "intersectionItem": {"key": "key3", "otherKey": "otherKey"},
    "anyItem": {"anyKey": "anyValue"},
    "optionalItem": "optionalValue",
    "nullableItem": None
}

# Layered application test data (app layer with "new" prefix)
j_supported_schemas_layered_application = {
    "newStringItem": "testString",
    "newLiteralStringItem": "literal",
    "newLiteralNumberItem": 1,
    "newEnumItem": "Enum1",
    "newNativeEnumItem": 2,
    "newDoubleItem": 3.14159,
    "newBigIntItem": 9223372036854775807,
    "newInt64Item": 123456789,
    "newInt32Item": 1234,
    "newBooleanItem": True,
    "newObjectItem": {"key": "key1"},
    "newDateItem": "2025-03-30T14:00:00",
    "newArrayItem": [[1.1, 2.2], [3.3, 4.4]],
    "newRecordItem": {"recordKey": 5.5},
    "newMapItem": {"mapKey": 6.6},
    "newSetItem": ["setValue1", "setValue2"],
    "newTupleItem": [42.42, "tupleString", True],
    "newUnionItem": {"key": "key1"},
    "newDiscriminatedUnionItem": {"key": "key2", "discriminator": "Enum1"},
    "newIntersectionItem": {"key": "key3", "otherKey": "otherKey"},
    "newAnyItem": {"anyKey": "anyValue"},
    "newOptionalItem": "optionalValue",
    "newNullableItem": None
}

# Test data for layered generics
j_generic_user_entities = {
    "normalUserEntity": {
        "id": "user_001",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "metadata": {
            "favoriteColor": "blue",
            "hobbies": ["reading", "coding", "gaming"]
        }
    },
    "adminUserEntity": {
        "id": "admin_001",
        "name": "Jane Smith",
        "email": "jane@admin.com",
        "age": 35,
        "metadata": {
            "adminLevel": 5,
            "permissions": ["read", "write", "delete", "admin"]
        }
    }
}

j_infrastructure_types = {
    "httpSuccessfulResponse": {
        "success": True,
        "data": {
            "id": "dto_001",
            "name": "Test Result",
            "age": 25
        }
    },
    "httpUnsuccessfulResponse": {
        "success": False,
        "message": "Operation failed",
        "details": {
            "errorCode": "ERR_001",
            "timestamp": "2025-11-29T10:00:00Z"
        }
    },
    "objectWithGeneric": {
        "internal": {
            "success": True,
            "data": {
                "id": "internal_001",
                "name": "Internal Data",
                "age": 28
            }
        },
        "item": {
            "success": True,
            "data": {
                "id": "item_001",
                "name": "Item Data",
                "age": 32
            }
        },
        "userItem": {
            "id": "user_002",
            "name": "User Item",
            "email": "user@item.com",
            "age": 27,
            "metadata": {
                "id": "meta_001",
                "name": "Meta Data",
                "age": 20
            }
        },
        "otherUserItem": {
            "id": "admin_002",
            "name": "Admin Item",
            "email": "admin@item.com",
            "age": 40,
            "metadata": {
                "adminLevel": 3,
                "permissions": ["read", "write"]
            }
        }
    },
    "dataRetrieve": {
        "success": True,
        "data": {
            "id": "retrieve_001",
            "name": "Retrieved Data",
            "age": 29
        }
    },
    "userRetrieve": {
        "success": True,
        "data": {
            "id": "normal_001",
            "name": "Normal User",
            "email": "normal@user.com",
            "age": 26,
            "metadata": {
                "favoriteColor": "green",
                "hobbies": ["swimming", "running"]
            }
        }
    },
    "intersectedDataRetrieve": {
        "success": True,
        "data": {
            "id": "intersect_data_001",
            "name": "Intersect Data",
            "age": 31
        },
        "id": "intersect_user_001",
        "name": "Intersect User",
        "email": "intersect@user.com",
        "age": 33,
        "metadata": {
            "code": "CODE_001",
            "description": "Intersection metadata"
        }
    }
}


def test_type_serialization(test_name: str, type_name: str, data: dict, cls, verbose: bool = False) -> bool:
    """
    Test serialization and deserialization of a type.
    Equivalent to testTypeSerialization in cpp_test_utils.cpp
    """
    result = False

    try:
        # Deserialize from dict
        deserialized = cls.from_dict(data)

        # Serialize back to dict
        serialized = deserialized.to_dict()

        if verbose:
            print(f"{type_name} - Serialized: {serialized}")

        if data == serialized:
            print(f"Test passed: {test_name} - Serialization and deserialization of {type_name} are equivalent.")
            result = True
        else:
            print(f"Test failed: {test_name} - Serialization and deserialization of {type_name} are not equivalent.")
            print(f"  Expected: {data}")
            print(f"  Got:      {serialized}")

    except Exception as e:
        print(f"Test error: {test_name} - {type_name} - Exception: {e}")

    return result
