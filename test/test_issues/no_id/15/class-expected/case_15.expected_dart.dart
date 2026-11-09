import 'package:json_annotation/json_annotation.dart';

import './case_15_domain.dart';

part 'case_15_app.g.dart';

typedef Price = Money;

@JsonSerializable(explicitToJson: true)
class Invoice {
  final String id;
  @JsonKey(fromJson: _moneyFromJson, toJson: _moneyToJson)
  final Money total;

  Invoice({
    required this.id,
    required this.total,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) =>
    _$InvoiceFromJson(json);

  Map<String, dynamic> toJson() => _$InvoiceToJson(this);
}

Money _moneyFromJson(Object? json) =>
  Money.fromJson(json as Map<String, dynamic>);

Map<String, dynamic> _moneyToJson(Money value) =>
  (value as dynamic).toJson() as Map<String, dynamic>;
