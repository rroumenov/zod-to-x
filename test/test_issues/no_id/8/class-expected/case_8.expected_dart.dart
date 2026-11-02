import 'package:json_annotation/json_annotation.dart';

part 'case_8_domain.g.dart';

@JsonSerializable(explicitToJson: true)
class Settings {
  final String name;
  final int retries;
  final bool enabled;
  final List<String> tags;
  final String nickname;
  final int port;
  final String title;
  final dynamic extra;

  Settings({
    required this.name,
    required this.retries,
    required this.enabled,
    required this.tags,
    required this.nickname,
    required this.port,
    required this.title,
    required this.extra,
  });

  factory Settings.fromJson(Map<String, dynamic> json) =>
    _$SettingsFromJson(json);

  Map<String, dynamic> toJson() => _$SettingsToJson(this);
}
