import 'package:json_annotation/json_annotation.dart';

import './case_12_domain.dart';

part 'case_12_app.g.dart';

typedef ShippingAddress = Address;

@JsonSerializable(explicitToJson: true)
class ShippingRequest {
  final String orderId;
  @JsonKey(fromJson: _addressFromJson, toJson: _addressToJson)
  final Address destination;

  ShippingRequest({
    required this.orderId,
    required this.destination,
  });

  factory ShippingRequest.fromJson(Map<String, dynamic> json) =>
    _$ShippingRequestFromJson(json);

  Map<String, dynamic> toJson() => _$ShippingRequestToJson(this);
}

Address _addressFromJson(Object? json) =>
  Address.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _addressToJson(Address value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
