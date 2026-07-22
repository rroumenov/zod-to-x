// This is
// a multiline
// header.

import 'package:json_annotation/json_annotation.dart';

part 'dart_supported_schemas.g.dart';

// An enum
@JsonEnum(valueField: 'value')
enum EnumItem {
  enum1('Enum1'),
  enum2('Enum2'),
  enum3('Enum3');

  const EnumItem(this.value);
  final String value;
}

// A native enum
typedef NativeEnumItem = dynamic;
// NativeEnumItem: mixed-type enum — no single Dart base type
// const nativeEnum1 = 1;
// const nativeEnum2 = 2;
// const nativeEnum3 = 'NativeEnum3';

// An object
@JsonSerializable(explicitToJson: true)
class ObjectItem {
  final String key;

  ObjectItem({
    required this.key,
  });

  factory ObjectItem.fromJson(Map<String, dynamic> json) =>
    _$ObjectItemFromJson(json);

  Map<String, dynamic> toJson() => _$ObjectItemToJson(this);
}

// Another object
@JsonSerializable(explicitToJson: true)
class OtherObjectItem {
  final String otherKey;

  OtherObjectItem({
    required this.otherKey,
  });

  factory OtherObjectItem.fromJson(Map<String, dynamic> json) =>
    _$OtherObjectItemFromJson(json);

  Map<String, dynamic> toJson() => _$OtherObjectItemToJson(this);
}

// A union of two objects
// UnionItem is a union of: ObjectItem, OtherObjectItem
typedef UnionItem = Object;

// An object with a discriminator
@JsonSerializable(explicitToJson: true)
class ObjectItemWithDiscriminator implements DiscriminatedUnionItem {
  final String key;
  final EnumItem discriminator;

  ObjectItemWithDiscriminator({
    required this.key,
    required this.discriminator,
  });

  factory ObjectItemWithDiscriminator.fromJson(Map<String, dynamic> json) =>
    _$ObjectItemWithDiscriminatorFromJson(json);

  Map<String, dynamic> toJson() => _$ObjectItemWithDiscriminatorToJson(this);
}

// Another object with a discriminator
@JsonSerializable(explicitToJson: true)
class OtherObjectItemWithDiscriminator implements DiscriminatedUnionItem {
  final String otherKey;
  final EnumItem discriminator;

  OtherObjectItemWithDiscriminator({
    required this.otherKey,
    required this.discriminator,
  });

  factory OtherObjectItemWithDiscriminator.fromJson(Map<String, dynamic> json) =>
    _$OtherObjectItemWithDiscriminatorFromJson(json);

  Map<String, dynamic> toJson() => _$OtherObjectItemWithDiscriminatorToJson(this);
}

// A discriminated union of two objects
// Discriminated union on 'discriminator'.
// Possible types: ObjectItemWithDiscriminator, OtherObjectItemWithDiscriminator
abstract class DiscriminatedUnionItem {}

DiscriminatedUnionItem discriminatedUnionItemFromJson(Map<String, dynamic> json) {
  return switch (json['discriminator']) {
    'Enum1' => ObjectItemWithDiscriminator.fromJson(json),
    'Enum2' => OtherObjectItemWithDiscriminator.fromJson(json),
    _ => throw Exception("Unknown DiscriminatedUnionItem discriminant: ${json['discriminator']}")
  };
}

// An intersection of two objects
@JsonSerializable(explicitToJson: true)
class IntersectionItem {
  final String key;
  final String otherKey;

  IntersectionItem({
    required this.key,
    required this.otherKey,
  });

  factory IntersectionItem.fromJson(Map<String, dynamic> json) =>
    _$IntersectionItemFromJson(json);

  Map<String, dynamic> toJson() => _$IntersectionItemToJson(this);
}

@JsonSerializable(explicitToJson: true)
class DartSupportedSchemas {

  // A simple string
  final String stringItem;

  // A literal string
  final String literalStringItem;

  // A literal number
  final int literalNumberItem;
  final EnumItem enumItem;
  final NativeEnumItem nativeEnumItem;

  // A double
  final double doubleItem;

  // A big integer
  final int bigIntItem;

  // A 64-bit integer
  final int int64Item;

  // A 32-bit integer
  final int int32Item;

  // A boolean
  final bool booleanItem;
  final ObjectItem objectItem;

  // A date
  final DateTime dateItem;

  // A two-dimensional array of numbers
  final List<List<double>> arrayItem;

  // A record with string keys and number values
  final Map<String, double> recordItem;

  // A map with string keys and number values
  final Map<String, double> mapItem;

  // A set of strings
  final Set<String> setItem;

  // A tuple of a number, a string, and a boolean
  final (double, String, bool) tupleItem;
  final UnionItem unionItem;
  @JsonKey(fromJson: discriminatedUnionItemFromJson, toJson: _discriminatedUnionItemToJson)
  final DiscriminatedUnionItem discriminatedUnionItem;
  final IntersectionItem intersectionItem;

  // Any type
  final dynamic anyItem;

  // An optional string
  final String? optionalItem;

  // A nullable string
  final String? nullableItem;

  DartSupportedSchemas({
    required this.stringItem,
    required this.literalStringItem,
    required this.literalNumberItem,
    required this.enumItem,
    required this.nativeEnumItem,
    required this.doubleItem,
    required this.bigIntItem,
    required this.int64Item,
    required this.int32Item,
    required this.booleanItem,
    required this.objectItem,
    required this.dateItem,
    required this.arrayItem,
    required this.recordItem,
    required this.mapItem,
    required this.setItem,
    required this.tupleItem,
    required this.unionItem,
    required this.discriminatedUnionItem,
    required this.intersectionItem,
    required this.anyItem,
    this.optionalItem,
    this.nullableItem,
  });

  factory DartSupportedSchemas.fromJson(Map<String, dynamic> json) =>
    _$DartSupportedSchemasFromJson(json);

  Map<String, dynamic> toJson() => _$DartSupportedSchemasToJson(this);
}

Map<String, dynamic> _discriminatedUnionItemToJson(DiscriminatedUnionItem value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
