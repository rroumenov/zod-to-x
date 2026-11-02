import 'package:json_annotation/json_annotation.dart';

part 'case_13_domain.g.dart';

@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class Page<TCursor, TContent> {
  final TCursor cursor;
  final TContent content;
  final int total;

  Page({
    required this.cursor,
    required this.content,
    required this.total,
  });

  factory Page.fromJson(Map<String, dynamic> json, TCursor Function(Object? json) fromJsonTCursor, TContent Function(Object? json) fromJsonTContent) =>
    _$PageFromJson(json, fromJsonTCursor, fromJsonTContent);

  Map<String, dynamic> toJson(Object? Function(TCursor value) toJsonTCursor, Object? Function(TContent value) toJsonTContent) =>
    _$PageToJson(this, toJsonTCursor, toJsonTContent);
}

@JsonSerializable(explicitToJson: true)
class Item {
  final String id;
  final double price;

  Item({
    required this.id,
    required this.price,
  });

  factory Item.fromJson(Map<String, dynamic> json) =>
    _$ItemFromJson(json);

  Map<String, dynamic> toJson() => _$ItemToJson(this);
}

typedef PageOfItems = Page<int, Item>;

typedef PageOfIds = Page<String, List<String>>;
