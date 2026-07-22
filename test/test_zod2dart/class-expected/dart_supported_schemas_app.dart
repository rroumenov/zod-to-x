import 'package:json_annotation/json_annotation.dart';

import './dart_supported_schemas_entity.dart';

part 'dart_supported_schemas_app.g.dart';

typedef NewStringItem = StringItem;

typedef NewEnumItem = EnumItem;

typedef NewNativeEnumItem = NativeEnumItem;

typedef NewDoubleItem = DoubleItem;

typedef NewBigIntItem = BigIntItem;

typedef NewInt64Item = Int64Item;

typedef NewInt32Item = Int32Item;

typedef NewBooleanItem = BooleanItem;

typedef NewObjectItem = ObjectItem;

typedef NewDateItem = DateItem;

typedef NewArrayItem = ArrayItem;

typedef NewRecordItem = RecordItem;

typedef NewMapItem = MapItem;

typedef NewSetItem = SetItem;

typedef NewTupleItem = TupleItem;

typedef NewUnionItem = UnionItem;

typedef NewDiscriminatedUnionItem = DiscriminatedUnionItem;

typedef NewIntersectionItem = IntersectionItem;

typedef NewAnyItem = AnyItem;

@JsonSerializable(explicitToJson: true)
class DartSupportedSchemasApplication {
  final NewStringItem newStringItem;

  // A literal string
  final String newLiteralStringItem;

  // A literal number
  final int newLiteralNumberItem;
  final NewEnumItem newEnumItem;
  final NewNativeEnumItem newNativeEnumItem;
  final NewDoubleItem newDoubleItem;
  final NewBigIntItem newBigIntItem;
  final NewInt64Item newInt64Item;
  final NewInt32Item newInt32Item;
  final NewBooleanItem newBooleanItem;
  @JsonKey(fromJson: _newObjectItemFromJson, toJson: _newObjectItemToJson)
  final NewObjectItem newObjectItem;
  final NewDateItem newDateItem;
  final NewArrayItem newArrayItem;
  final NewRecordItem newRecordItem;
  final NewMapItem newMapItem;
  final NewSetItem newSetItem;
  final NewTupleItem newTupleItem;
  final NewUnionItem newUnionItem;
  @JsonKey(fromJson: discriminatedUnionItemFromJson, toJson: _newDiscriminatedUnionItemToJson)
  final NewDiscriminatedUnionItem newDiscriminatedUnionItem;
  final NewIntersectionItem newIntersectionItem;
  final NewAnyItem newAnyItem;

  // An optional string
  final String? newOptionalItem;

  // A nullable string
  final String? newNullableItem;

  DartSupportedSchemasApplication({
    required this.newStringItem,
    required this.newLiteralStringItem,
    required this.newLiteralNumberItem,
    required this.newEnumItem,
    required this.newNativeEnumItem,
    required this.newDoubleItem,
    required this.newBigIntItem,
    required this.newInt64Item,
    required this.newInt32Item,
    required this.newBooleanItem,
    required this.newObjectItem,
    required this.newDateItem,
    required this.newArrayItem,
    required this.newRecordItem,
    required this.newMapItem,
    required this.newSetItem,
    required this.newTupleItem,
    required this.newUnionItem,
    required this.newDiscriminatedUnionItem,
    required this.newIntersectionItem,
    required this.newAnyItem,
    this.newOptionalItem,
    this.newNullableItem,
  });

  factory DartSupportedSchemasApplication.fromJson(Map<String, dynamic> json) =>
    _$DartSupportedSchemasApplicationFromJson(json);

  Map<String, dynamic> toJson() => _$DartSupportedSchemasApplicationToJson(this);
}

NewObjectItem _newObjectItemFromJson(Object? json) =>
  NewObjectItem.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _newObjectItemToJson(NewObjectItem value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;

Map<String, dynamic> _newDiscriminatedUnionItemToJson(NewDiscriminatedUnionItem value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
