// This is
// a multiline
// header.

import 'package:json_annotation/json_annotation.dart';

import './user.entity.dart';

part 'user.dtos.g.dart';

@JsonSerializable(explicitToJson: true)
class CreateUserUseCaseDto {
  final String name;
  final String email;
  final int? age;
  final UserRole role;

  CreateUserUseCaseDto({
    required this.name,
    required this.email,
    this.age,
    required this.role,
  });

  factory CreateUserUseCaseDto.fromJson(Map<String, dynamic> json) =>
    _$CreateUserUseCaseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateUserUseCaseDtoToJson(this);
}

@JsonSerializable(explicitToJson: true)
class CreateUserUseCaseResultDto {
  final String id;
  final String name;
  final String email;
  final int? age;
  final DateTime createdAt;
  final DateTime updatedAt;

  CreateUserUseCaseResultDto({
    required this.id,
    required this.name,
    required this.email,
    this.age,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CreateUserUseCaseResultDto.fromJson(Map<String, dynamic> json) =>
    _$CreateUserUseCaseResultDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateUserUseCaseResultDtoToJson(this);
}

typedef UpdateUserUseCaseDto = CreateUserUseCaseDto;

typedef UpdateUserUseCaseResultDto = UserEntity;

@JsonSerializable(explicitToJson: true)
class UserDtos {
  final CreateUserUseCaseDto createUserUseCaseDto;
  final CreateUserUseCaseResultDto createUserUseCaseResultDto;
  @JsonKey(fromJson: _updateUserUseCaseDtoFromJson, toJson: _updateUserUseCaseDtoToJson)
  final UpdateUserUseCaseDto updateUserUseCaseDto;
  @JsonKey(fromJson: _updateUserUseCaseResultDtoFromJson, toJson: _updateUserUseCaseResultDtoToJson)
  final UpdateUserUseCaseResultDto updateUserUseCaseResultDto;

  UserDtos({
    required this.createUserUseCaseDto,
    required this.createUserUseCaseResultDto,
    required this.updateUserUseCaseDto,
    required this.updateUserUseCaseResultDto,
  });

  factory UserDtos.fromJson(Map<String, dynamic> json) =>
    _$UserDtosFromJson(json);

  Map<String, dynamic> toJson() => _$UserDtosToJson(this);
}

UpdateUserUseCaseDto _updateUserUseCaseDtoFromJson(Object? json) =>
  UpdateUserUseCaseDto.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _updateUserUseCaseDtoToJson(UpdateUserUseCaseDto value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;

UpdateUserUseCaseResultDto _updateUserUseCaseResultDtoFromJson(Object? json) =>
  UpdateUserUseCaseResultDto.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _updateUserUseCaseResultDtoToJson(UpdateUserUseCaseResultDto value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
