import "package:app/data/enums/balance_card_status.dart";
import "package:app/data/models/payment/payout.dart";

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
