// This is
// a multiline
// header.

import 'package:json_annotation/json_annotation.dart';

import './user.dtos.dart';

part 'user.api.g.dart';

typedef ReqUpdateUser = UpdateUserUseCaseDto;

typedef ResUpdateUser = UpdateUserUseCaseResultDto;

@JsonSerializable(explicitToJson: true)
class ResUpdateUserMulti {
  final int amount;
  @JsonKey(fromJson: _updateUserUseCaseResultDtoListFromJson, toJson: _updateUserUseCaseResultDtoListToJson)
  final List<UpdateUserUseCaseResultDto> data;

  ResUpdateUserMulti({
    required this.amount,
    required this.data,
  });

  factory ResUpdateUserMulti.fromJson(Map<String, dynamic> json) =>
    _$ResUpdateUserMultiFromJson(json);

  Map<String, dynamic> toJson() => _$ResUpdateUserMultiToJson(this);
}

@JsonSerializable(explicitToJson: true)
class UserApi {
  @JsonKey(fromJson: _reqUpdateUserFromJson, toJson: _reqUpdateUserToJson)
  final ReqUpdateUser reqUpdateUser;
  @JsonKey(fromJson: _resUpdateUserFromJson, toJson: _resUpdateUserToJson)
  final ResUpdateUser resUpdateUser;
  final ResUpdateUserMulti resUpdateUserMulti;

  UserApi({
    required this.reqUpdateUser,
    required this.resUpdateUser,
    required this.resUpdateUserMulti,
  });

  factory UserApi.fromJson(Map<String, dynamic> json) =>
    _$UserApiFromJson(json);

  Map<String, dynamic> toJson() => _$UserApiToJson(this);
}

List<UpdateUserUseCaseResultDto> _updateUserUseCaseResultDtoListFromJson(Object? json) =>
  (json as List<dynamic>).map((e) => UpdateUserUseCaseResultDto.fromJson(e as Map<String, dynamic>)).toList();

List<Map<String, dynamic>> _updateUserUseCaseResultDtoListToJson(List<UpdateUserUseCaseResultDto> list) =>
  list.map((e) => (e as dynamic).toJson() as Map<String, dynamic>).toList();

ReqUpdateUser _reqUpdateUserFromJson(Object? json) =>
  ReqUpdateUser.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _reqUpdateUserToJson(ReqUpdateUser value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;

ResUpdateUser _resUpdateUserFromJson(Object? json) =>
  ResUpdateUser.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _resUpdateUserToJson(ResUpdateUser value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
