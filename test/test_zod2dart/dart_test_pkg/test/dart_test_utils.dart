// Shared roundtrip test helper and JSON fixtures for Dart transpiler native tests.
// Dart serialization notes vs Go:
//   setItem       → JSON array (Dart Set serializes as array, not object)
//   tupleItem     → JSON object ({"$1": num, "$2": str, "$3": bool}) — Dart record serialization
//   dateItem      → "2025-03-30T14:00:00.000Z" (toIso8601String() adds milliseconds)
//   nullableItem  → null (json_serializable includes null fields by default)
//   enum values   → string value from @JsonEnum(valueField: 'value')

import 'dart:convert';
import 'package:test/test.dart';

/// Validates roundtrip JSON consistency:
/// 1. Decode fixture JSON string to a Map.
/// 2. Call fromJson to build the Dart object.
/// 3. Call toJson to re-encode.
/// 4. Compare the two maps for deep equality.
void testRoundtrip<T>(
  String name,
  String fixtureJson,
  T Function(Map<String, dynamic> json) fromJson,
  Map<String, dynamic> Function(T obj) toJson,
) {
  test(name, () {
    final input = jsonDecode(fixtureJson) as Map<String, dynamic>;
    final T obj = fromJson(input);
    final output = toJson(obj);
    expect(
      output,
      equals(input),
      reason: '$name — serialization and deserialization are not equivalent.',
    );
  });
}

// ── Discriminated union standalone fixtures ───────────────────────────────────

const jObjectItemWithDiscriminator = '{"key": "testKey", "discriminator": "Enum1"}';
const jOtherObjectItemWithDiscriminator = '{"otherKey": "testOtherKey", "discriminator": "Enum2"}';

// ── Flat supported schemas ────────────────────────────────────────────────────
// Dart notes:
//   setItem: JSON array (not object — Dart Set serializes as List)
//   tupleItem: JSON object with "$1"/"$2"/"$3" keys — Dart record serialization
//   nullableItem: null (included by json_serializable by default)

const jObjectItem = '{"key": "key1"}';
const jOtherObjectItem = '{"otherKey": "otherKey1"}';
const jIntersectionItem = '{"key": "key3", "otherKey": "otherKey"}';

const jDartSupportedSchemas = '''
{
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
  "dateItem": "2025-03-30T14:00:00.000Z",
  "arrayItem": [[1.1, 2.2], [3.3, 4.4]],
  "recordItem": {"recordKey": 5.5},
  "mapItem": {"mapKey": 6.6},
  "setItem": ["setValue1", "setValue2"],
  "tupleItem": {"\$1": 42.42, "\$2": "tupleString", "\$3": true},
  "unionItem": {"key": "key1"},
  "discriminatedUnionItem": {"key": "discKey", "discriminator": "Enum1"},
  "intersectionItem": {"key": "key3", "otherKey": "otherKey"},
  "anyItem": {"anyKey": "anyValue"},
  "optionalItem": "optionalValue",
  "nullableItem": null
}
''';

// ── Layered entity supported schemas (adds 3 extra object fields) ─────────────

const jDartSupportedSchemasEntity = '''
{
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
  "dateItem": "2025-03-30T14:00:00.000Z",
  "arrayItem": [[1.1, 2.2], [3.3, 4.4]],
  "recordItem": {"recordKey": 5.5},
  "mapItem": {"mapKey": 6.6},
  "setItem": ["setValue1", "setValue2"],
  "tupleItem": {"\$1": 42.42, "\$2": "tupleString", "\$3": true},
  "unionItem": {"key": "key1"},
  "discriminatedUnionItem": {"key": "discKey", "discriminator": "Enum1"},
  "intersectionItem": {"key": "key3", "otherKey": "otherKey"},
  "anyItem": {"anyKey": "anyValue"},
  "optionalItem": "optionalValue",
  "nullableItem": null
}
''';

// ── Layered application supported schemas (new-prefixed field names) ──────────

const jDartSupportedSchemasApplication = '''
{
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
  "newDateItem": "2025-03-30T14:00:00.000Z",
  "newArrayItem": [[1.1, 2.2], [3.3, 4.4]],
  "newRecordItem": {"recordKey": 5.5},
  "newMapItem": {"mapKey": 6.6},
  "newSetItem": ["setValue1", "setValue2"],
  "newTupleItem": {"\$1": 42.42, "\$2": "tupleString", "\$3": true},
  "newUnionItem": {"key": "key1"},
  "newDiscriminatedUnionItem": {"key": "discKey", "discriminator": "Enum1"},
  "newIntersectionItem": {"key": "key3", "otherKey": "otherKey"},
  "newAnyItem": {"anyKey": "anyValue"},
  "newOptionalItem": "optionalValue",
  "newNullableItem": null
}
''';

// ── User domain fixtures ──────────────────────────────────────────────────────

const jUserEntity =
    '{"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"}';

const jUserModels = '''
{
  "userRole": "Admin",
  "userEntity": {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"}
}
''';

const jCreateUserUseCaseDto =
    '{"name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"}';

const jCreateUserUseCaseResultDto = '''
{
  "id": "101",
  "name": "Alice",
  "email": "alice@example.com",
  "age": 30,
  "createdAt": "2025-03-30T14:00:00.000Z",
  "updatedAt": "2025-03-30T15:00:00.000Z"
}
''';

const jUserDtos = '''
{
  "createUserUseCaseDto": {"name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
  "createUserUseCaseResultDto": {
    "id": "101", "name": "Alice", "email": "alice@example.com", "age": 30,
    "createdAt": "2025-03-30T14:00:00.000Z", "updatedAt": "2025-03-30T15:00:00.000Z"
  },
  "updateUserUseCaseDto": {"name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
  "updateUserUseCaseResultDto": {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"}
}
''';

const jResUpdateUserMulti = '''
{
  "amount": 2,
  "data": [
    {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
    {"id": "102", "name": "Bob",   "email": "bob@example.com",   "age": 25, "role": "User"}
  ]
}
''';

const jUserApi = '''
{
  "reqUpdateUser": {"name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
  "resUpdateUser": {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
  "resUpdateUserMulti": {
    "amount": 2,
    "data": [
      {"id": "101", "name": "Alice", "email": "alice@example.com", "age": 30, "role": "Admin"},
      {"id": "102", "name": "Bob",   "email": "bob@example.com",   "age": 25, "role": "User"}
    ]
  }
}
''';

// ── Layered generics fixtures ─────────────────────────────────────────────────

const jNormalUserMetadata = '{"favoriteColor": "blue", "hobbies": ["reading", "coding", "gaming"]}';

const jAdminUserMetadata = '{"adminLevel": 5, "permissions": ["read", "write", "delete", "admin"]}';

const jNormalUserEntity = '''
{
  "id": "user_001", "name": "John Doe", "email": "john@example.com", "age": 30,
  "metadata": {"favoriteColor": "blue", "hobbies": ["reading", "coding", "gaming"]}
}
''';

const jAdminUserEntity = '''
{
  "id": "admin_001", "name": "Jane Smith", "email": "jane@admin.com", "age": 35,
  "metadata": {"adminLevel": 5, "permissions": ["read", "write", "delete", "admin"]}
}
''';

const jSomeDtoResult = '{"id": "dto_001", "name": "Test Result", "age": 25}';

const jOtherDtoResult = '{"code": "CODE_001", "description": "Intersection metadata"}';

const jHttpSuccessfulResponse = '''
{
  "success": true,
  "data": {"id": "dto_001", "name": "Test Result", "age": 25}
}
''';

const jHttpUnsuccessfulResponse = '''
{
  "success": false,
  "message": "Operation failed",
  "details": {"errorCode": "ERR_001", "timestamp": "2025-11-29T10:00:00Z"}
}
''';

const jHttpErrorResponse = '{"message": "Test error message"}';

const jObjectWithGeneric = '''
{
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
}
''';

const jIntersectedDataRetrieve = '''
{
  "success": true,
  "data":     {"id": "intersect_data_001", "name": "Intersect Data", "age": 31},
  "id":       "intersect_user_001",
  "name":     "Intersect User",
  "email":    "intersect@user.com",
  "age":      33,
  "metadata": {"code": "CODE_001", "description": "Intersection metadata"}
}
''';
