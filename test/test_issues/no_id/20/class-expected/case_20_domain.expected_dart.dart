import 'package:json_annotation/json_annotation.dart';

part 'case_20_domain.g.dart';

@JsonEnum(valueField: 'value')
enum SortField {
  name('Name'),
  date('Date');

  const SortField(this.value);
  final String value;
}

@JsonSerializable(explicitToJson: true)
class Item {
  final String id;

  Item({
    required this.id,
  });

  factory Item.fromJson(Map<String, dynamic> json) =>
    _$ItemFromJson(json);

  Map<String, dynamic> toJson() => _$ItemToJson(this);
}

@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class Box<T> {
  final T value;

  Box({
    required this.value,
  });

  factory Box.fromJson(Map<String, dynamic> json, T Function(Object? json) fromJsonT) =>
    _$BoxFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
    _$BoxToJson(this, toJsonT);
}

@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class Pair<A, B> {
  final A first;
  final B second;

  Pair({
    required this.first,
    required this.second,
  });

  factory Pair.fromJson(Map<String, dynamic> json, A Function(Object? json) fromJsonA, B Function(Object? json) fromJsonB) =>
    _$PairFromJson(json, fromJsonA, fromJsonB);

  Map<String, dynamic> toJson(Object? Function(A value) toJsonA, Object? Function(B value) toJsonB) =>
    _$PairToJson(this, toJsonA, toJsonB);
}

typedef ItemBox = Box<Item>;

typedef StrBox = Box<String>;

typedef SortBox = Box<SortField>;

typedef ItemPair = Pair<Item, SortField>;

@JsonEnum(valueField: 'value')
enum MessageType {
  ping('Ping'),
  sort('Sort'),
  item('Item');

  const MessageType(this.value);
  final String value;
}

@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class Message<K, P> implements AnyMessage {
  final K type;
  final P payload;

  Message({
    required this.type,
    required this.payload,
  });

  factory Message.fromJson(Map<String, dynamic> json, K Function(Object? json) fromJsonK, P Function(Object? json) fromJsonP) =>
    _$MessageFromJson(json, fromJsonK, fromJsonP);

  Map<String, dynamic> toJson(Object? Function(K value) toJsonK, Object? Function(P value) toJsonP) =>
    _$MessageToJson(this, toJsonK, toJsonP);
}

// Discriminated union on 'type'.
// Possible types: Message<MessageType, String>, Message<MessageType, SortField>, Message<MessageType, Item>
abstract class AnyMessage {}

AnyMessage anyMessageFromJson(Map<String, dynamic> json) {
  return switch (json['type']) {
    'Ping' => Message.fromJson(json, (j) => MessageType.values.firstWhere((e) => e.value == j), (j) => j as String),
    'Sort' => Message.fromJson(json, (j) => MessageType.values.firstWhere((e) => e.value == j), (j) => SortField.values.firstWhere((e) => e.value == j)),
    'Item' => Message.fromJson(json, (j) => MessageType.values.firstWhere((e) => e.value == j), (j) => Item.fromJson(j as Map<String, dynamic>)),
    _ => throw Exception("Unknown AnyMessage discriminant: ${json['type']}")
  };
}

Map<String, dynamic> anyMessageToJson(AnyMessage value) => switch (value) {
  Message<MessageType, String> x => x.toJson((v) => v.value, (v) => v),
  Message<MessageType, SortField> x => x.toJson((v) => v.value, (v) => v.value),
  Message<MessageType, Item> x => x.toJson((v) => v.value, (v) => v.toJson()),
  _ => (value as dynamic).toJson() as Map<String, dynamic>,
};

@JsonSerializable(explicitToJson: true)
class Holder {
  @JsonKey(fromJson: anyMessageFromJson, toJson: anyMessageToJson)
  final AnyMessage message;
  @JsonKey(fromJson: _anyMessageListFromJson, toJson: _anyMessageListToJson)
  final List<AnyMessage> messages;

  Holder({
    required this.message,
    required this.messages,
  });

  factory Holder.fromJson(Map<String, dynamic> json) =>
    _$HolderFromJson(json);

  Map<String, dynamic> toJson() => _$HolderToJson(this);
}

List<AnyMessage> _anyMessageListFromJson(Object? json) =>
  (json as List<dynamic>).map((e) => anyMessageFromJson(e as Map<String, dynamic>)).toList();

List<Map<String, dynamic>> _anyMessageListToJson(List<AnyMessage> list) =>
  list.map(anyMessageToJson).toList();

