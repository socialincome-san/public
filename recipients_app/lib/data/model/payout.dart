import "package:dart_mappable/dart_mappable.dart";

part "payout.mapper.dart";

@MappableClass()
class Payout with PayoutMappable {
  final String id;

  final double amount;

  final double? amountChf;

  final String currency;

  final DateTime paymentAt;

  final String status;

  final String? phoneNumber;

  final String? comments;

  final String recipientId;

  final String createdAt;
  final String? updatedAt;

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
