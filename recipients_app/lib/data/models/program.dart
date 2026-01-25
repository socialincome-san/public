import "package:app/data/enums/payout_interval.dart";
import "package:app/data/models/currency.dart";
import "package:dart_mappable/dart_mappable.dart";

part "program.mapper.dart";

@MappableClass()
class Program with ProgramMappable {
  final String id;
  final String name;
  final String countryId;
  final int payoutPerInterval;
  final Currency payoutCurrency;
  final PayoutInterval payoutInterval;
  final int programDurationInMonths;
  final String createdAt;
  final String? updatedAt;

  const Program({
    required this.id,
    required this.name,
    required this.countryId,
    required this.payoutPerInterval,
    required this.payoutCurrency,
    required this.payoutInterval,
    required this.programDurationInMonths,
    required this.createdAt,
    this.updatedAt,
  });
}
