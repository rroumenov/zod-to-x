package models

import (
	"bytes"
	"encoding/json"
	"reflect"
	"testing"
)

// testSerialization validates roundtrip consistency:
//  1. Unmarshal fixture JSON into the concrete Go type
//  2. Marshal the Go type back to JSON
//  3. Compare both JSON representations semantically (key-order independent,
//     integer-precision preserving via json.Decoder.UseNumber)
func testSerialization(t *testing.T, name string, fixture []byte, v any) {
	t.Helper()

	if err := json.Unmarshal(fixture, v); err != nil {
		t.Fatalf("Test error: %s — Unmarshal failed: %v", name, err)
	}

	got, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("Test error: %s — Marshal failed: %v", name, err)
	}

	decode := func(data []byte) any {
		dec := json.NewDecoder(bytes.NewReader(data))
		dec.UseNumber()
		var val any
		if err := dec.Decode(&val); err != nil {
			t.Fatalf("Test error: %s — JSON parse failed: %v", name, err)
		}
		return val
	}

	want := decode(fixture)
	gotVal := decode(got)

	if !reflect.DeepEqual(want, gotVal) {
		t.Errorf(
			"Test failed: %s — serialization and deserialization are not equivalent.\n  input:  %s\n  output: %s",
			name, fixture, got,
		)
	} else {
		t.Logf("Test passed: %s — serialization and deserialization are equivalent.", name)
	}
}

// ── Discriminated union standalone fixtures ───────────────────────────────────
// Use UnmarshalDiscriminatedUnionItem for dispatch (interface-typed parent field
// cannot be deserialized directly).
var jObjectItemWithDiscriminator = []byte(`{"key": "testKey", "discriminator": "Enum1"}`)
var jOtherObjectItemWithDiscriminator = []byte(`{"otherKey": "testOtherKey", "discriminator": "Enum2"}`)

// ── Supported schemas fixtures ────────────────────────────────────────────────
// Go serialization notes:
//   setItem: {"key":{}} object form (map[string]struct{} marshals as object)
//   nullableItem: omitted (nil *T with omitempty → key absent on marshal)
//   discriminatedUnionItem: null — parent struct field is interface-typed; use UnmarshalDiscriminatedUnionItem for standalone dispatch

var jSupportedSchemas = []byte(`{
	"stringItem": "testString",
	"literalStringItem": "literalString",
	"literalNumberItem": 42,
	"enumItem": "Enum1",
	"nativeEnumItem": 2,
	"doubleItem": 3.14159,
	"bigIntItem": 9223372036854775807,
	"int64Item": 123456789,
	"int32Item": 1234,
	"booleanItem": true,
	"objectItem": {"key": "key1"},
	"dateItem": "2025-03-30T14:00:00Z",
	"arrayItem": [[1.1, 2.2], [3.3, 4.4]],
	"recordItem": {"recordKey": 5.5},
	"mapItem": {"mapKey": 6.6},
	"setItem": {"setValue1": {}, "setValue2": {}},
	"tupleItem": [42.42, "tupleString", true],
	"unionItem": {"key": "key1"},
	"discriminatedUnionItem": null,
	"intersectionItem": {"key": "key3", "otherKey": "otherKey"},
	"anyItem": {"anyKey": "anyValue"},
	"optionalItem": "optionalValue"
}`)

var jSupportedSchemasLayeredEntity = []byte(`{
	"stringItem": "testString",
	"literalStringItem": "literalString",
	"literalNumberItem": 42,
	"enumItem": "Enum1",
	"nativeEnumItem": 2,
	"doubleItem": 3.14159,
	"bigIntItem": 9223372036854775807,
	"int64Item": 123456789,
	"int32Item": 1234,
	"booleanItem": true,
	"objectItem": {"key": "key1"},
	"otherObjectItem": {"otherKey": "otherKey1"},
	"objectItemWithDiscriminator": {"key": "key2", "discriminator": "Enum1"},
	"otherObjectItemWithDiscriminator": {"otherKey": "otherKey2", "discriminator": "Enum2"},
	"dateItem": "2025-03-30T14:00:00Z",
	"arrayItem": [[1.1, 2.2], [3.3, 4.4]],
	"recordItem": {"recordKey": 5.5},
	"mapItem": {"mapKey": 6.6},
	"setItem": {"setValue1": {}, "setValue2": {}},
	"tupleItem": [42.42, "tupleString", true],
	"unionItem": {"key": "key1"},
	"discriminatedUnionItem": null,
	"intersectionItem": {"key": "key3", "otherKey": "otherKey"},
	"anyItem": {"anyKey": "anyValue"},
	"optionalItem": "optionalValue"
}`)

var jSupportedSchemasLayeredApplication = []byte(`{
	"newStringItem": "testString",
	"newLiteralStringItem": "literalString",
	"newLiteralNumberItem": 42,
	"newEnumItem": "Enum1",
	"newNativeEnumItem": 2,
	"newDoubleItem": 3.14159,
	"newBigIntItem": 9223372036854775807,
	"newInt64Item": 123456789,
	"newInt32Item": 1234,
	"newBooleanItem": true,
	"newObjectItem": {"key": "key1"},
	"newDateItem": "2025-03-30T14:00:00Z",
	"newArrayItem": [[1.1, 2.2], [3.3, 4.4]],
	"newRecordItem": {"recordKey": 5.5},
	"newMapItem": {"mapKey": 6.6},
	"newSetItem": {"setValue1": {}, "setValue2": {}},
	"newTupleItem": [42.42, "tupleString", true],
	"newUnionItem": {"key": "key1"},
	"newDiscriminatedUnionItem": null,
	"newIntersectionItem": {"key": "key3", "otherKey": "otherKey"},
	"newAnyItem": {"anyKey": "anyValue"},
	"newOptionalItem": "optionalValue"
}`)

// ── User domain fixtures ──────────────────────────────────────────────────────

var jUserModels = []byte(`{
	"userRole": "Admin",
	"userEntity": {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"}
}`)

var jUserEntity = []byte(`{
	"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"
}`)

var jUserDtos = []byte(`{
	"createUserUseCaseDto": {"name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
	"createUserUseCaseResultDto": {
		"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30,
		"createdAt": "2025-03-30T14:00:00Z", "updatedAt": "2025-03-30T15:00:00Z"
	},
	"updateUserUseCaseDto": {"name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
	"updateUserUseCaseResultDto": {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"}
}`)

var jUserApi = []byte(`{
	"reqUpdateUser": {"name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
	"resUpdateUserMulti": {
		"amount": 19,
		"data": [
			{"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
			{"id": "102", "name": "Bob",   "email": "bob@example.com",   "age": 25, "role": "User"}
		]
	},
	"resUpdateUser": {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"}
}`)

// ── Layered generics fixtures ─────────────────────────────────────────────────

var jNormalUserEntity = []byte(`{
	"id": "user_001", "name": "John Doe", "email": "john@example.com", "age": 30,
	"metadata": {"favoriteColor": "blue", "hobbies": ["reading", "coding", "gaming"]}
}`)

var jAdminUserEntity = []byte(`{
	"id": "admin_001", "name": "Jane Smith", "email": "jane@admin.com", "age": 35,
	"metadata": {"adminLevel": 5, "permissions": ["read", "write", "delete", "admin"]}
}`)

var jNormalUserMetadata = []byte(`{"favoriteColor": "blue", "hobbies": ["reading", "coding", "gaming"]}`)

var jAdminUserMetadata = []byte(`{"adminLevel": 5, "permissions": ["read", "write", "delete", "admin"]}`)

var jSomeDtoResult = []byte(`{"id": "dto_001", "name": "Test Result", "age": 25}`)

var jOtherDtoResult = []byte(`{"code": "CODE_001", "description": "Intersection metadata"}`)

var jHttpUnsuccessfulResponse = []byte(`{
	"success": false,
	"message": "Operation failed",
	"details": {"errorCode": "ERR_001", "timestamp": "2025-11-29T10:00:00Z"}
}`)

var jHttpErrorResponse = []byte(`{"message": "Test error message"}`)

var jHttpSuccessfulResponseSomeDto = []byte(`{
	"success": true,
	"data": {"id": "dto_001", "name": "Test Result", "age": 25}
}`)

// GenericUserEntity[SomeDtoResult] — used as ObjectWithGeneric.userItem
var jGenericUserEntitySomeDto = []byte(`{
	"id": "user_002", "name": "User Item", "email": "user@item.com", "age": 27,
	"metadata": {"id": "meta_001", "name": "Meta Data", "age": 20}
}`)

var jInternalObjectWithGeneric = []byte(`{
	"success": true,
	"data": {"id": "internal_001", "name": "Internal Data", "age": 28}
}`)

var jDataRetrieve = []byte(`{
	"success": true,
	"data": {"id": "retrieve_001", "name": "Retrieved Data", "age": 29}
}`)

var jUserRetrieve = []byte(`{
	"success": true,
	"data": {
		"id": "normal_001", "name": "Normal User", "email": "normal@user.com", "age": 26,
		"metadata": {"favoriteColor": "green", "hobbies": ["swimming", "running"]}
	}
}`)

var jObjectWithGeneric = []byte(`{
	"internal": {"success": true, "data": {"id": "internal_001", "name": "Internal Data", "age": 28}},
	"item":     {"success": true, "data": {"id": "item_001",     "name": "Item Data",     "age": 32}},
	"userItem": {
		"id": "user_002", "name": "User Item", "email": "user@item.com", "age": 27,
		"metadata": {"id": "meta_001", "name": "Meta Data", "age": 20}
	},
	"otherUserItem": {
		"id": "admin_002", "name": "Admin Item", "email": "admin@item.com", "age": 40,
		"metadata": {"adminLevel": 3, "permissions": ["read", "write"]}
	}
}`)

// IntersectedDataRetrieve is a flat struct merging HttpSuccessfulResponse[SomeDtoResult]
// and GenericUserEntity[OtherDtoResult]. Both contribute top-level JSON fields.
var jIntersectedDataRetrieve = []byte(`{
	"success": true,
	"data": {"id": "intersect_data_001", "name": "Intersect Data", "age": 31},
	"id": "intersect_user_001",
	"name": "Intersect User",
	"email": "intersect@user.com",
	"age": 33,
	"metadata": {"code": "CODE_001", "description": "Intersection metadata"}
}`)
