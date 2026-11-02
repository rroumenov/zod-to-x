import 'package:json_annotation/json_annotation.dart';

part 'case_11_domain.g.dart';

@JsonSerializable(explicitToJson: true)
class UserEntity {
  final String id;
  final String name;

  UserEntity({
    required this.id,
    required this.name,
  });

  factory UserEntity.fromJson(Map<String, dynamic> json) =>
    _$UserEntityFromJson(json);

  Map<String, dynamic> toJson() => _$UserEntityToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Group {
  final UserEntity owner;
  final List<UserEntity> members;

  Group({
    required this.owner,
    required this.members,
  });

  factory Group.fromJson(Map<String, dynamic> json) =>
    _$GroupFromJson(json);

  Map<String, dynamic> toJson() => _$GroupToJson(this);
}
