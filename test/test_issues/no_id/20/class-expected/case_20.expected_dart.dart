import 'package:json_annotation/json_annotation.dart';

import './case_20_domain.dart';

part 'case_20_app.g.dart';

@JsonSerializable(explicitToJson: true)
class Usage {
  @JsonKey(fromJson: _itemBoxFromJson, toJson: _itemBoxToJson)
  final ItemBox itemBox;
  @JsonKey(fromJson: _strBoxFromJson, toJson: _strBoxToJson)
  final StrBox strBox;
  @JsonKey(fromJson: _sortBoxFromJson, toJson: _sortBoxToJson)
  final SortBox sortBox;
  @JsonKey(fromJson: _itemPairFromJson, toJson: _itemPairToJson)
  final ItemPair itemPair;
  @JsonKey(fromJson: _itemPairListFromJson, toJson: _itemPairListToJson)
  final List<ItemPair> pairs;
  @JsonKey(fromJson: anyMessageFromJson, toJson: anyMessageToJson)
  final AnyMessage message;

  Usage({
    required this.itemBox,
    required this.strBox,
    required this.sortBox,
    required this.itemPair,
    required this.pairs,
    required this.message,
  });

  factory Usage.fromJson(Map<String, dynamic> json) =>
    _$UsageFromJson(json);

  Map<String, dynamic> toJson() => _$UsageToJson(this);
}

ItemBox _itemBoxFromJson(Object? json) =>
  Box.fromJson(json as Map<String, dynamic>, (j) => Item.fromJson(j as Map<String, dynamic>));

Map<String, dynamic> _itemBoxToJson(ItemBox value) =>
  value.toJson((v) => v.toJson());

StrBox _strBoxFromJson(Object? json) =>
  Box.fromJson(json as Map<String, dynamic>, (j) => j as String);

Map<String, dynamic> _strBoxToJson(StrBox value) =>
  value.toJson((v) => v);

SortBox _sortBoxFromJson(Object? json) =>
  Box.fromJson(json as Map<String, dynamic>, (j) => SortField.values.firstWhere((e) => e.value == j));

Map<String, dynamic> _sortBoxToJson(SortBox value) =>
  value.toJson((v) => v.value);

ItemPair _itemPairFromJson(Object? json) =>
  Pair.fromJson(json as Map<String, dynamic>, (j) => Item.fromJson(j as Map<String, dynamic>), (j) => SortField.values.firstWhere((e) => e.value == j));

Map<String, dynamic> _itemPairToJson(ItemPair value) =>
  value.toJson((v) => v.toJson(), (v) => v.value);

List<ItemPair> _itemPairListFromJson(Object? json) =>
  (json as List<dynamic>).map((e) => ItemPair.fromJson(e as Map<String, dynamic>, (j) => Item.fromJson(j as Map<String, dynamic>), (j) => SortField.values.firstWhere((e) => e.value == j))).toList();

List<Map<String, dynamic>> _itemPairListToJson(List<ItemPair> list) =>
  list.map((e) => e.toJson((v) => v.toJson(), (v) => v.value)).toList();

