import 'package:json_annotation/json_annotation.dart';

import './case_15_domain.dart';

part 'case_15_app.g.dart';

typedef Price = Money;

@JsonSerializable(explicitToJson: true)
class Invoice {
  final String id;
  @JsonKey(fromJson: _priceFromJson, toJson: _priceToJson)
  final Price total;

  Invoice({
    required this.id,
    required this.total,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) =>
    _$InvoiceFromJson(json);

  Map<String, dynamic> toJson() => _$InvoiceToJson(this);
}

Price _priceFromJson(Object? json) =>
  Price.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _priceToJson(Price value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
