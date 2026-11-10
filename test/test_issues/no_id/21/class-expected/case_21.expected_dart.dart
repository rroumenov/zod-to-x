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

// Description of the base type.
typedef Restated = Documented;

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

@JsonSerializable(explicitToJson: true)
class Order {
  // Field redefining the base description.
  final Documented redefined;
  // Description of the base type.
  final Documented restated;
  // Field documenting an undocumented type.
  final Uuid documented;
  // Described before optional.
  final Uuid? describedBefore;
  // Described after optional.
  final Uuid? describedAfter;
  // List of identifiers.
  final List<Uuid> list;
  // Field of an object type.
  @JsonKey(fromJson: _addressFromJson, toJson: _addressToJson)
  final Address address;
  // Field of an enum type.
  final Currency currency;
  // Field of a basic type.
  final String local;
  final Documented plain;
  final Documented? plainOptional;

  Order({
    required this.redefined,
    required this.restated,
    required this.documented,
    this.describedBefore,
    this.describedAfter,
    required this.list,
    required this.address,
    required this.currency,
    required this.local,
    required this.plain,
    this.plainOptional,
  });

  factory Order.fromJson(Map<String, dynamic> json) =>
    _$OrderFromJson(json);

  Map<String, dynamic> toJson() => _$OrderToJson(this);
}

Address _addressFromJson(Object? json) =>
  Address.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _addressToJson(Address value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
