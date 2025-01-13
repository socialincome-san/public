import "package:app/data/models/payment/social_income_payment.dart";
import "package:app/data/models/recipient.dart";

abstract class PaymentDataSource {
  Future<List<SocialIncomePayment>> fetchPayments({
    required String recipientId,
  });

  Future<void> confirmPayment({
    required Recipient recipient,
    required SocialIncomePayment payment,
  });

  Future<void> contestPayment({
    required Recipient recipient,
    required SocialIncomePayment payment,
    required String contestReason,
  });
}
