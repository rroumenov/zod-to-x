// This is
// a multiline
// header.

import 'package:json_annotation/json_annotation.dart';

import './layered_generics.app.dart';

part 'layered_generics.infra.g.dart';

@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class HttpSuccessfulResponse<T> implements DiscriminantDataRetrieve {
  final bool success;
  final T data;

  HttpSuccessfulResponse({
    required this.success,
    required this.data,
  });

  factory HttpSuccessfulResponse.fromJson(Map<String, dynamic> json, T Function(Object? json) fromJsonT) =>
    _$HttpSuccessfulResponseFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
    _$HttpSuccessfulResponseToJson(this, toJsonT);
}

@JsonSerializable(explicitToJson: true)
class HttpUnsuccessfulResponse implements DiscriminantDataRetrieve {
  final bool success;
  final String message;
  final Map<String, dynamic>? details;

  HttpUnsuccessfulResponse({
    required this.success,
    required this.message,
    this.details,
  });

  factory HttpUnsuccessfulResponse.fromJson(Map<String, dynamic> json) =>
    _$HttpUnsuccessfulResponseFromJson(json);

  Map<String, dynamic> toJson() => _$HttpUnsuccessfulResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class HttpErrorResponse {
  final String message;

  HttpErrorResponse({
    required this.message,
  });

  factory HttpErrorResponse.fromJson(Map<String, dynamic> json) =>
    _$HttpErrorResponseFromJson(json);

  Map<String, dynamic> toJson() => _$HttpErrorResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class SomeDtoResult {
  final String id;
  final String name;
  final int age;

  SomeDtoResult({
    required this.id,
    required this.name,
    required this.age,
  });

  factory SomeDtoResult.fromJson(Map<String, dynamic> json) =>
    _$SomeDtoResultFromJson(json);

  Map<String, dynamic> toJson() => _$SomeDtoResultToJson(this);
}

typedef InternalObjectWithGeneric = HttpSuccessfulResponse<SomeDtoResult>;

@JsonSerializable(explicitToJson: true)
class ObjectWithGeneric {
  @JsonKey(fromJson: _internalObjectWithGenericFromJson, toJson: _internalObjectWithGenericToJson)
  final InternalObjectWithGeneric internal;
  final HttpSuccessfulResponse<SomeDtoResult> item;
  @JsonKey(fromJson: _genericUserEntityFromJson, toJson: _genericUserEntityToJson)
  final GenericUserEntity<SomeDtoResult> userItem;
  @JsonKey(fromJson: _adminUserEntityFromJson, toJson: _adminUserEntityToJson)
  final AdminUserEntity otherUserItem;

  ObjectWithGeneric({
    required this.internal,
    required this.item,
    required this.userItem,
    required this.otherUserItem,
  });

  factory ObjectWithGeneric.fromJson(Map<String, dynamic> json) =>
    _$ObjectWithGenericFromJson(json);

  Map<String, dynamic> toJson() => _$ObjectWithGenericToJson(this);
}

@JsonSerializable(explicitToJson: true)
class OtherDtoResult {
  final String code;
  final String description;

  OtherDtoResult({
    required this.code,
    required this.description,
  });

  factory OtherDtoResult.fromJson(Map<String, dynamic> json) =>
    _$OtherDtoResultFromJson(json);

  Map<String, dynamic> toJson() => _$OtherDtoResultToJson(this);
}

typedef DataRetrieve = HttpSuccessfulResponse<SomeDtoResult>;

// Discriminated union on 'success'.
// Possible types: HttpSuccessfulResponse<SomeDtoResult>, HttpUnsuccessfulResponse
abstract class DiscriminantDataRetrieve {}

DiscriminantDataRetrieve discriminantDataRetrieveFromJson(Map<String, dynamic> json) {
  return switch (json['success']) {
    true => HttpSuccessfulResponse.fromJson(json, (j) => SomeDtoResult.fromJson(j as Map<String, dynamic>)),
    false => HttpUnsuccessfulResponse.fromJson(json),
    _ => throw Exception("Unknown DiscriminantDataRetrieve discriminant: ${json['success']}")
  };
}

@JsonSerializable(explicitToJson: true)
class IntersectedDataRetrieve {
  final bool success;
  final SomeDtoResult data;
  final String id;
  final String name;
  final String email;
  final int? age;
  final OtherDtoResult metadata;

  IntersectedDataRetrieve({
    required this.success,
    required this.data,
    required this.id,
    required this.name,
    required this.email,
    this.age,
    required this.metadata,
  });

  factory IntersectedDataRetrieve.fromJson(Map<String, dynamic> json) =>
    _$IntersectedDataRetrieveFromJson(json);

  Map<String, dynamic> toJson() => _$IntersectedDataRetrieveToJson(this);
}

typedef UserRetrieve = HttpSuccessfulResponse<NormalUserEntity>;

InternalObjectWithGeneric _internalObjectWithGenericFromJson(Object? json) =>
  HttpSuccessfulResponse.fromJson(json as Map<String, dynamic>, (j) => SomeDtoResult.fromJson(j as Map<String, dynamic>));

Map<String, dynamic> _internalObjectWithGenericToJson(InternalObjectWithGeneric value) =>
  value.toJson((v) => v.toJson());

GenericUserEntity<SomeDtoResult> _genericUserEntityFromJson(Object? json) =>
  GenericUserEntity.fromJson(json as Map<String, dynamic>, (j) => SomeDtoResult.fromJson(j as Map<String, dynamic>));

Map<String, dynamic> _genericUserEntityToJson(GenericUserEntity<SomeDtoResult> value) =>
  value.toJson((v) => v.toJson());

AdminUserEntity _adminUserEntityFromJson(Object? json) =>
  GenericUserEntity.fromJson(json as Map<String, dynamic>, (j) => AdminUserMetadata.fromJson(j as Map<String, dynamic>));

Map<String, dynamic> _adminUserEntityToJson(AdminUserEntity value) =>
  value.toJson((v) => v.toJson());
