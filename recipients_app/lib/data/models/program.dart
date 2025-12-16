import "package:app/data/enums/payout_interval.dart";
import "package:app/data/models/currency.dart";
import "package:dart_mappable/dart_mappable.dart";

part "program.mapper.dart";

@MappableClass()
class Program with ProgramMappable {
  final String id;
  final String name;
  final String country;
  final double payoutAmount;
  final Currency payoutCurrency;

  final PayoutInterval payoutInterval;
  final int totalPayments;

  final String createdAt;
  final String? updatedAt;

  const Program({
    required this.id,
    required this.name,
    required this.country,
    required this.payoutAmount,
    required this.payoutCurrency,
    required this.payoutInterval,
    required this.totalPayments,
    required this.createdAt,
    this.updatedAt,
  });
}
