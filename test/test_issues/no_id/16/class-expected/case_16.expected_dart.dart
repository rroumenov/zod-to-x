import 'package:json_annotation/json_annotation.dart';

import './case_16_domain.dart';

part 'case_16_app.g.dart';

typedef ShippingAddress = Address;

typedef OrderItem = Item;

typedef PaymentCurrency = Currency;

typedef RefundCurrency = Currency;

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

typedef Customer = Contact;

@JsonSerializable(explicitToJson: true)
class Order {
  final String id;
  @JsonKey(fromJson: _addressFromJson, toJson: _addressToJson)
  final Address destination;
  @JsonKey(fromJson: _addressFromJson, toJson: _addressToJson)
  final Address? billing;
  @JsonKey(fromJson: _itemListFromJson, toJson: _itemListToJson)
  final List<Item> items;
  final Currency currency;
  final Contact contact;

  Order({
    required this.id,
    required this.destination,
    this.billing,
    required this.items,
    required this.currency,
    required this.contact,
  });

  factory Order.fromJson(Map<String, dynamic> json) =>
    _$OrderFromJson(json);

  Map<String, dynamic> toJson() => _$OrderToJson(this);
}

typedef AddressList = List<Address>;

typedef OrderItemPage = Page<Item>;

Address _addressFromJson(Object? json) =>
  Address.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _addressToJson(Address value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;

List<Item> _itemListFromJson(Object? json) =>
  (json as List<dynamic>).map((e) => Item.fromJson(e as Map<String, dynamic>)).toList();

List<Map<String, dynamic>> _itemListToJson(List<Item> list) =>
  list.map((e) => (e as dynamic).toJson() as Map<String, dynamic>).toList();
