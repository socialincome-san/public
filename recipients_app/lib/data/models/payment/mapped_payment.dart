import "package:app/data/models/payment/payment.dart";
import "package:dart_mappable/dart_mappable.dart";

part "mapped_payment.mapper.dart";

@MappableClass()
class MappedPayment with MappedPaymentMappable {
  final SocialIncomePayment payment;
  final PaymentUiStatus uiStatus;

  const MappedPayment({
    required this.payment,
    required this.uiStatus,
  });
}
