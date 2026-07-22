import 'package:json_annotation/json_annotation.dart';

import './user.entity.dart';

part 'user.dtos.g.dart';

@JsonSerializable(explicitToJson: true)
class UserConfigAdmin implements UserConfig {
  final UserRole role;
  final List<String> permissions;

  UserConfigAdmin({
    required this.role,
    required this.permissions,
  });

  factory UserConfigAdmin.fromJson(Map<String, dynamic> json) =>
    _$UserConfigAdminFromJson(json);

  Map<String, dynamic> toJson() => _$UserConfigAdminToJson(this);
}

@JsonSerializable(explicitToJson: true)
class UserConfigUser implements UserConfig {
  final UserRole role;
  final bool banned;

  UserConfigUser({
    required this.role,
    required this.banned,
  });

  factory UserConfigUser.fromJson(Map<String, dynamic> json) =>
    _$UserConfigUserFromJson(json);

  Map<String, dynamic> toJson() => _$UserConfigUserToJson(this);
}

// Discriminated union on 'role'.
// Possible types: UserConfigAdmin, UserConfigUser
abstract class UserConfig {}

UserConfig userConfigFromJson(Map<String, dynamic> json) {
  return switch (json['role']) {
    'Admin' => UserConfigAdmin.fromJson(json),
    'User' => UserConfigUser.fromJson(json),
    _ => throw Exception("Unknown UserConfig discriminant: ${json['role']}")
  };
}
