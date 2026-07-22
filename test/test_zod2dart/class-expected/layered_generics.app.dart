// This is
// a multiline
// header.

import 'package:json_annotation/json_annotation.dart';

part 'layered_generics.app.g.dart';

// GenericUserEntity
@JsonSerializable(explicitToJson: true, genericArgumentFactories: true)
class GenericUserEntity<T> {
  final String id;
  final String name;
  final String email;
  final int? age;
  final T metadata;

  GenericUserEntity({
    required this.id,
    required this.name,
    required this.email,
    this.age,
    required this.metadata,
  });

  factory GenericUserEntity.fromJson(Map<String, dynamic> json, T Function(Object? json) fromJsonT) =>
    _$GenericUserEntityFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
    _$GenericUserEntityToJson(this, toJsonT);
}

// NormalUserMetadata
@JsonSerializable(explicitToJson: true)
class NormalUserMetadata {
  final String favoriteColor;
  final List<String> hobbies;

  NormalUserMetadata({
    required this.favoriteColor,
    required this.hobbies,
  });

  factory NormalUserMetadata.fromJson(Map<String, dynamic> json) =>
    _$NormalUserMetadataFromJson(json);

  Map<String, dynamic> toJson() => _$NormalUserMetadataToJson(this);
}

typedef NormalUserEntity = GenericUserEntity<NormalUserMetadata>;

// AdminUserMetadata
@JsonSerializable(explicitToJson: true)
class AdminUserMetadata {
  final int adminLevel;
  final List<String> permissions;

  AdminUserMetadata({
    required this.adminLevel,
    required this.permissions,
  });

  factory AdminUserMetadata.fromJson(Map<String, dynamic> json) =>
    _$AdminUserMetadataFromJson(json);

  Map<String, dynamic> toJson() => _$AdminUserMetadataToJson(this);
}

typedef AdminUserEntity = GenericUserEntity<AdminUserMetadata>;

typedef RecordStringAny = Map<String, dynamic>;

// UserEntities
// UserEntities is a union of: NormalUserEntity, AdminUserEntity, GenericUserEntity<RecordStringAny>
typedef UserEntities = Object;
