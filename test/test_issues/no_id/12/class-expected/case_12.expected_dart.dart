import 'package:json_annotation/json_annotation.dart';

import './case_12_domain.dart';

part 'case_12_app.g.dart';

typedef ShippingAddress = Address;

@JsonSerializable(explicitToJson: true)
class ShippingRequest {
  final String orderId;
  @JsonKey(fromJson: _shippingAddressFromJson, toJson: _shippingAddressToJson)
  final ShippingAddress destination;

  ShippingRequest({
    required this.orderId,
    required this.destination,
  });

  factory ShippingRequest.fromJson(Map<String, dynamic> json) =>
    _$ShippingRequestFromJson(json);

  Map<String, dynamic> toJson() => _$ShippingRequestToJson(this);
}

ShippingAddress _shippingAddressFromJson(Object? json) =>
  ShippingAddress.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _shippingAddressToJson(ShippingAddress value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
