import "package:app/data/models/payment/balance_card_status.dart";
import "package:app/data/models/payment/social_income_payment.dart";

class BalanceCardUiState {
  final BalanceCardStatus status;
  final List<SocialIncomePayment> payments;
  final int paymentsCount;
  final int unconfirmedPaymentsCount;

  BalanceCardUiState({
    required this.paymentsCount,
    this.unconfirmedPaymentsCount = 0,
    required this.status,
    required this.payments,
  });
}
