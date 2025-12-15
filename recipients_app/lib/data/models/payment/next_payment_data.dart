import "package:app/data/model/currency.dart";
import "package:dart_mappable/dart_mappable.dart";

part "next_payment_data.mapper.dart";

@MappableClass()
class NextPaymentData with NextPaymentDataMappable {
  final int amount;
  final Currency currency;
  final int daysToPayment;

  const NextPaymentData({
    required this.amount,
    required this.currency,
    required this.daysToPayment,
  });
}
