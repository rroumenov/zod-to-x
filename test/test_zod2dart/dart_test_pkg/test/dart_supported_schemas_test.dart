import 'dart:convert';
import 'package:test/test.dart';
import '../lib/dart_supported_schemas.dart';
import 'dart_test_utils.dart';

void main() {
  group('ObjectItem', () {
    testRoundtrip('roundtrip', jObjectItem, ObjectItem.fromJson, (o) => o.toJson());
  });

  group('OtherObjectItem', () {
    testRoundtrip('roundtrip', jOtherObjectItem, OtherObjectItem.fromJson, (o) => o.toJson());
  });

  group('ObjectItemWithDiscriminator', () {
    testRoundtrip(
      'roundtrip',
      jObjectItemWithDiscriminator,
      ObjectItemWithDiscriminator.fromJson,
      (o) => o.toJson(),
    );
  });

  group('OtherObjectItemWithDiscriminator', () {
    testRoundtrip(
      'roundtrip',
      jOtherObjectItemWithDiscriminator,
      OtherObjectItemWithDiscriminator.fromJson,
      (o) => o.toJson(),
    );
  });

  group('discriminatedUnionItemFromJson dispatch', () {
    test('Enum1 → ObjectItemWithDiscriminator', () {
      final json = jsonDecode(jObjectItemWithDiscriminator) as Map<String, dynamic>;
      final result = discriminatedUnionItemFromJson(json);
      expect(result, isA<ObjectItemWithDiscriminator>());
      final v = result as ObjectItemWithDiscriminator;
      expect(v.key, equals('testKey'));
      expect(v.discriminator, equals(EnumItem.enum1));
    });

    test('Enum2 → OtherObjectItemWithDiscriminator', () {
      final json = jsonDecode(jOtherObjectItemWithDiscriminator) as Map<String, dynamic>;
      final result = discriminatedUnionItemFromJson(json);
      expect(result, isA<OtherObjectItemWithDiscriminator>());
      final v = result as OtherObjectItemWithDiscriminator;
      expect(v.otherKey, equals('testOtherKey'));
      expect(v.discriminator, equals(EnumItem.enum2));
    });

    test('unknown discriminant → throws Exception', () {
      final json = jsonDecode('{"discriminator": "Unknown"}') as Map<String, dynamic>;
      expect(() => discriminatedUnionItemFromJson(json), throwsA(isA<Exception>()));
    });
  });

  group('IntersectionItem', () {
    testRoundtrip('roundtrip', jIntersectionItem, IntersectionItem.fromJson, (o) => o.toJson());
  });

  group('DartSupportedSchemas', () {
    testRoundtrip(
      'roundtrip',
      jDartSupportedSchemas,
      DartSupportedSchemas.fromJson,
      (o) => o.toJson(),
    );
  });
}
