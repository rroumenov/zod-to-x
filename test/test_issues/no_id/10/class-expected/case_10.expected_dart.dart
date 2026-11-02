import 'package:json_annotation/json_annotation.dart';

part 'case_10_domain.g.dart';

// Account status
@JsonEnum(valueField: 'value')
enum Status {
  active('Active'),
  inactive('Inactive');

  const Status(this.value);
  final String value;
}

// Postal address
@JsonSerializable(explicitToJson: true)
class Address {
  final String street;
  final String city;

  Address({
    required this.street,
    required this.city,
  });

  factory Address.fromJson(Map<String, dynamic> json) =>
    _$AddressFromJson(json);

  Map<String, dynamic> toJson() => _$AddressToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Account {
  final String id;
  final Status status;
  final Address address;

  Account({
    required this.id,
    required this.status,
    required this.address,
  });

  factory Account.fromJson(Map<String, dynamic> json) =>
    _$AccountFromJson(json);

  Map<String, dynamic> toJson() => _$AccountToJson(this);
}
