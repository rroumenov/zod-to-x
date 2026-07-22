import 'package:json_annotation/json_annotation.dart';

part 'user.dtos.g.dart';

@JsonSerializable(explicitToJson: true)
class CreateUserDto {
  final String name;
  final List<String> permissions;

  CreateUserDto({
    required this.name,
    required this.permissions,
  });

  factory CreateUserDto.fromJson(Map<String, dynamic> json) =>
    _$CreateUserDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateUserDtoToJson(this);
}

typedef UpdateUserDto = CreateUserDto;
