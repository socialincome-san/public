import "package:dart_mappable/dart_mappable.dart";

part "next_payment_data.mapper.dart";

@MappableClass()
class NextPaymentData with NextPaymentDataMappable {
  final int amount;
  final String currency;
  final int daysToPayment;

  const NextPaymentData({
    required this.amount,
    required this.currency,
    required this.daysToPayment,
  });
}
