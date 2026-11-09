import 'package:json_annotation/json_annotation.dart';

import './case_21_domain.dart';

part 'case_21_app.g.dart';

// Identifier of the UTM campaign.
typedef UtmId = Uuid;

// Where the order is sent.
typedef ShippingAddress = Address;

// Currency of the payment.
typedef PaymentCurrency = Currency;

// Tags of the order.
typedef OrderTags = Tags;

// Description of the alias.
typedef Renamed = Documented;

typedef Inherited = Documented;

typedef Undocumented = Uuid;

@JsonSerializable(explicitToJson: true)
class Contact {
  final String email;

  Contact({
    required this.email,
  });

  factory Contact.fromJson(Map<String, dynamic> json) =>
    _$ContactFromJson(json);

  Map<String, dynamic> toJson() => _$ContactToJson(this);
}

// Contact that places the order.
typedef Customer = Contact;
