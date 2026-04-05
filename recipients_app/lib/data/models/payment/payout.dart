import "package:app/core/helpers/date_time_converter.dart";
import "package:app/data/enums/payout_status.dart";
import "package:dart_mappable/dart_mappable.dart";

part "payout.mapper.dart";

@MappableClass()
class Payout with PayoutMappable {
  final String id;
  final int amount;
  final double? amountChf;
  final String currency;
  @MappableField(hook: DateTimeHook())
  final DateTime paymentAt;
  final PayoutStatus status;
  final String? phoneNumber;
  final String? comments;
  final String recipientId;
  @MappableField(hook: DateTimeHook())
  final DateTime createdAt;
  @MappableField(hook: DateTimeHook())
  final DateTime? updatedAt;

  const Payout({
    required this.id,
    required this.amount,
    this.amountChf,
    required this.currency,
    required this.paymentAt,
    required this.status,
    this.phoneNumber,
    this.comments,
    required this.recipientId,
    required this.createdAt,
    this.updatedAt,
  });
}
