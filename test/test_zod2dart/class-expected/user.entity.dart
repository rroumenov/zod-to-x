// This is
// a multiline
// header.

import 'package:json_annotation/json_annotation.dart';

part 'user.entity.g.dart';

@JsonEnum(valueField: 'value')
enum UserRole {
  admin('Admin'),
  user('User');

  const UserRole(this.value);
  final String value;
}

@JsonSerializable(explicitToJson: true)
class UserEntity {
  final String id;
  final String name;
  final String email;
  final int? age;
  final UserRole role;

  UserEntity({
    required this.id,
    required this.name,
    required this.email,
    this.age,
    required this.role,
  });

  factory UserEntity.fromJson(Map<String, dynamic> json) =>
    _$UserEntityFromJson(json);

  Map<String, dynamic> toJson() => _$UserEntityToJson(this);
}

@JsonSerializable(explicitToJson: true)
class UserModels {
  final UserRole userRole;
  final UserEntity userEntity;

  UserModels({
    required this.userRole,
    required this.userEntity,
  });

  factory UserModels.fromJson(Map<String, dynamic> json) =>
    _$UserModelsFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelsToJson(this);
}
