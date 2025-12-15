import "package:app/data/model/payout.dart";
import "package:app/data/models/payment/balance_card_status.dart";

class BalanceCardUiState {
  final BalanceCardStatus status;
  final List<Payout> payout;
  final int paymentsCount;
  final int unconfirmedPaymentsCount;

  BalanceCardUiState({
    required this.paymentsCount,
    this.unconfirmedPaymentsCount = 0,
    required this.status,
    required this.payout,
  });
}
