import 'package:json_annotation/json_annotation.dart';

import './case_19_domain.dart';

part 'case_19_app.g.dart';

// Discriminated union on 'kind'.
// Possible types: AnyEventCreated, AnyEventDeleted
abstract class AnyEvent {}

/// AnyEvent variant of Created, declared in another file.
class AnyEventCreated implements AnyEvent {
  final Created value;

  const AnyEventCreated(this.value);

  Map<String, dynamic> toJson() => value.toJson();
}

/// AnyEvent variant of Deleted, declared in another file.
class AnyEventDeleted implements AnyEvent {
  final Deleted value;

  const AnyEventDeleted(this.value);

  Map<String, dynamic> toJson() => value.toJson();
}

AnyEvent anyEventFromJson(Map<String, dynamic> json) {
  return switch (json['kind']) {
    'Created' => AnyEventCreated(Created.fromJson(json)),
    'Deleted' => AnyEventDeleted(Deleted.fromJson(json)),
    _ => throw Exception("Unknown AnyEvent discriminant: ${json['kind']}")
  };
}

Map<String, dynamic> anyEventToJson(AnyEvent value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;

@JsonSerializable(explicitToJson: true)
class Archived implements MixedEvent {
  final EventKind kind;
  final String id;

  Archived({
    required this.kind,
    required this.id,
  });

  factory Archived.fromJson(Map<String, dynamic> json) =>
    _$ArchivedFromJson(json);

  Map<String, dynamic> toJson() => _$ArchivedToJson(this);
}

// Discriminated union on 'kind'.
// Possible types: MixedEventCreated, Archived
abstract class MixedEvent {}

/// MixedEvent variant of Created, declared in another file.
class MixedEventCreated implements MixedEvent {
  final Created value;

  const MixedEventCreated(this.value);

  Map<String, dynamic> toJson() => value.toJson();
}

MixedEvent mixedEventFromJson(Map<String, dynamic> json) {
  return switch (json['kind']) {
    'Created' => MixedEventCreated(Created.fromJson(json)),
    'Archived' => Archived.fromJson(json),
    _ => throw Exception("Unknown MixedEvent discriminant: ${json['kind']}")
  };
}

Map<String, dynamic> mixedEventToJson(MixedEvent value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;

// Discriminated union on 'type'.
// Possible types: AnyMessageInfo, AnyMessageAlert
abstract class AnyMessage {}

/// AnyMessage variant of Message<MessageType, Notice>, declared in another file.
class AnyMessageInfo implements AnyMessage {
  final Message<MessageType, Notice> value;

  const AnyMessageInfo(this.value);

  Map<String, dynamic> toJson() => value.toJson((v) => v.value, (v) => v.toJson());
}

/// AnyMessage variant of Message<MessageType, Alert>, declared in another file.
class AnyMessageAlert implements AnyMessage {
  final Message<MessageType, Alert> value;

  const AnyMessageAlert(this.value);

  Map<String, dynamic> toJson() => value.toJson((v) => v.value, (v) => v.toJson());
}

AnyMessage anyMessageFromJson(Map<String, dynamic> json) {
  return switch (json['type']) {
    'Info' => AnyMessageInfo(Message.fromJson(json, (j) => MessageType.values.firstWhere((e) => e.value == j), (j) => Notice.fromJson(j as Map<String, dynamic>))),
    'Alert' => AnyMessageAlert(Message.fromJson(json, (j) => MessageType.values.firstWhere((e) => e.value == j), (j) => Alert.fromJson(j as Map<String, dynamic>))),
    _ => throw Exception("Unknown AnyMessage discriminant: ${json['type']}")
  };
}

Map<String, dynamic> anyMessageToJson(AnyMessage value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;

@JsonSerializable(explicitToJson: true)
class EventLog {
  @JsonKey(fromJson: anyEventFromJson, toJson: anyEventToJson)
  final AnyEvent event;
  @JsonKey(fromJson: mixedEventFromJson, toJson: mixedEventToJson)
  final MixedEvent mixed;
  @JsonKey(fromJson: anyMessageFromJson, toJson: anyMessageToJson)
  final AnyMessage message;
  @JsonKey(fromJson: _anyEventListFromJson, toJson: _anyEventListToJson)
  final List<AnyEvent> history;
  @JsonKey(fromJson: anyEventFromJson, toJson: _anyEventNullableToJson)
  final AnyEvent? last;
  @JsonKey(fromJson: _anyEventMapFromJson, toJson: _anyEventMapToJson)
  final Map<String, AnyEvent> byId;

  EventLog({
    required this.event,
    required this.mixed,
    required this.message,
    required this.history,
    this.last,
    required this.byId,
  });

  factory EventLog.fromJson(Map<String, dynamic> json) =>
    _$EventLogFromJson(json);

  Map<String, dynamic> toJson() => _$EventLogToJson(this);
}

List<AnyEvent> _anyEventListFromJson(Object? json) =>
  (json as List<dynamic>).map((e) => anyEventFromJson(e as Map<String, dynamic>)).toList();

List<Map<String, dynamic>> _anyEventListToJson(List<AnyEvent> list) =>
  list.map(anyEventToJson).toList();

Map<String, dynamic>? _anyEventNullableToJson(AnyEvent? value) =>
  value == null ? null : anyEventToJson(value);

Map<String, AnyEvent> _anyEventMapFromJson(Object? json) =>
  (json as Map<String, dynamic>).map((k, e) => MapEntry(k, anyEventFromJson(e as Map<String, dynamic>)));

Map<String, Map<String, dynamic>> _anyEventMapToJson(Map<String, AnyEvent> map) =>
  map.map((k, e) => MapEntry(k, anyEventToJson(e)));

