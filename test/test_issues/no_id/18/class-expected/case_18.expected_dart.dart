import 'package:json_annotation/json_annotation.dart';

part 'case_18.g.dart';

@JsonEnum(valueField: 'value')
enum MessageType {
  userCreated('UserCreated'),
  userDeleted('UserDeleted');

  const MessageType(this.value);
  final String value;
}

@JsonSerializable(explicitToJson: true)
class UserCreated {
  final String id;
  final String name;

  UserCreated({
    required this.id,
    required this.name,
  });

  factory UserCreated.fromJson(Map<String, dynamic> json) =>
    _$UserCreatedFromJson(json);

  Map<String, dynamic> toJson() => _$UserCreatedToJson(this);
}

@JsonSerializable(explicitToJson: true)
class UserDeleted {
  final String id;
  final String? reason;

  UserDeleted({
    required this.id,
    this.reason,
  });

  factory UserDeleted.fromJson(Map<String, dynamic> json) =>
    _$UserDeletedFromJson(json);

  Map<String, dynamic> toJson() => _$UserDeletedToJson(this);
}

@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class Message<K, P> implements AnyMessage {
  final K type;
  final P payload;
  final double sentAt;

  Message({
    required this.type,
    required this.payload,
    required this.sentAt,
  });

  factory Message.fromJson(Map<String, dynamic> json, K Function(Object? json) fromJsonK, P Function(Object? json) fromJsonP) =>
    _$MessageFromJson(json, fromJsonK, fromJsonP);

  Map<String, dynamic> toJson(Object? Function(K value) toJsonK, Object? Function(P value) toJsonP) =>
    _$MessageToJson(this, toJsonK, toJsonP);
}

// Discriminated union on 'type'.
// Possible types: Message<MessageType, UserCreated>, Message<MessageType, UserDeleted>
abstract class AnyMessage {}

AnyMessage anyMessageFromJson(Map<String, dynamic> json) {
  return switch (json['type']) {
    'UserCreated' => Message.fromJson(json, (j) => MessageType.values.firstWhere((e) => e.value == j), (j) => UserCreated.fromJson(j as Map<String, dynamic>)),
    'UserDeleted' => Message.fromJson(json, (j) => MessageType.values.firstWhere((e) => e.value == j), (j) => UserDeleted.fromJson(j as Map<String, dynamic>)),
    _ => throw Exception("Unknown AnyMessage discriminant: ${json['type']}")
  };
}

