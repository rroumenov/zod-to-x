import 'package:json_annotation/json_annotation.dart';

part 'case_19_domain.g.dart';

@JsonEnum(valueField: 'value')
enum EventKind {
  created('Created'),
  deleted('Deleted'),
  archived('Archived');

  const EventKind(this.value);
  final String value;
}

@JsonSerializable(explicitToJson: true)
class Created {
  final EventKind kind;
  final String id;

  Created({
    required this.kind,
    required this.id,
  });

  factory Created.fromJson(Map<String, dynamic> json) =>
    _$CreatedFromJson(json);

  Map<String, dynamic> toJson() => _$CreatedToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Deleted {
  final EventKind kind;
  final String id;
  final String? reason;

  Deleted({
    required this.kind,
    required this.id,
    this.reason,
  });

  factory Deleted.fromJson(Map<String, dynamic> json) =>
    _$DeletedFromJson(json);

  Map<String, dynamic> toJson() => _$DeletedToJson(this);
}

@JsonEnum(valueField: 'value')
enum MessageType {
  info('Info'),
  alert('Alert');

  const MessageType(this.value);
  final String value;
}

@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class Message<K, P> {
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

@JsonSerializable(explicitToJson: true)
class Notice {
  final String text;

  Notice({
    required this.text,
  });

  factory Notice.fromJson(Map<String, dynamic> json) =>
    _$NoticeFromJson(json);

  Map<String, dynamic> toJson() => _$NoticeToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Alert {
  final String text;
  final int level;

  Alert({
    required this.text,
    required this.level,
  });

  factory Alert.fromJson(Map<String, dynamic> json) =>
    _$AlertFromJson(json);

  Map<String, dynamic> toJson() => _$AlertToJson(this);
}

