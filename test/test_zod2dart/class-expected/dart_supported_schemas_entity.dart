import 'package:json_annotation/json_annotation.dart';

part 'dart_supported_schemas_entity.g.dart';

// A simple string
typedef StringItem = String;

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

// A double
typedef DoubleItem = double;

// A big integer
typedef BigIntItem = int;

// A 64-bit integer
typedef Int64Item = int;

// A 32-bit integer
typedef Int32Item = int;

// A boolean
typedef BooleanItem = bool;

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

// Other Object Item
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

// Object Item With Discriminator
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

// Other Object Item With Discriminator
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

// A date
typedef DateItem = DateTime;

// A two-dimensional array of numbers
typedef ArrayItem = List<List<double>>;

// A record with string keys and number values
typedef RecordItem = Map<String, double>;

// A map with string keys and number values
typedef MapItem = Map<String, double>;

// A set of strings
typedef SetItem = Set<String>;

// A tuple of a number, a string, and a boolean
typedef TupleItem = (double, String, bool);

// Union Item
// UnionItem is a union of: ObjectItem, OtherObjectItem
typedef UnionItem = Object;

// Discriminated Union Item
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

// Intersection Item
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

// Any type
typedef AnyItem = dynamic;

@JsonSerializable(explicitToJson: true)
class DartSupportedSchemas {
  final StringItem stringItem;

  // A literal string
  final String literalStringItem;

  // A literal number
  final int literalNumberItem;
  final EnumItem enumItem;
  final NativeEnumItem nativeEnumItem;
  final DoubleItem doubleItem;
  final BigIntItem bigIntItem;
  final Int64Item int64Item;
  final Int32Item int32Item;
  final BooleanItem booleanItem;
  final ObjectItem objectItem;
  final OtherObjectItem otherObjectItem;
  final ObjectItemWithDiscriminator objectItemWithDiscriminator;
  final OtherObjectItemWithDiscriminator otherObjectItemWithDiscriminator;
  final DateItem dateItem;
  final ArrayItem arrayItem;
  final RecordItem recordItem;
  final MapItem mapItem;
  final SetItem setItem;
  final TupleItem tupleItem;
  final UnionItem unionItem;
  @JsonKey(fromJson: discriminatedUnionItemFromJson, toJson: _discriminatedUnionItemToJson)
  final DiscriminatedUnionItem discriminatedUnionItem;
  final IntersectionItem intersectionItem;
  final AnyItem anyItem;

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
    required this.otherObjectItem,
    required this.objectItemWithDiscriminator,
    required this.otherObjectItemWithDiscriminator,
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
