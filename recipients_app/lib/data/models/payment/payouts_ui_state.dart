import "package:app/data/enums/balance_card_status.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/data/models/payment/next_payout_data.dart";
import "package:dart_mappable/dart_mappable.dart";

part "payouts_ui_state.mapper.dart";

@MappableClass()
class PayoutsUiState with PayoutsUiStateMappable {
  final BalanceCardStatus status;
  final List<MappedPayout> payouts;
  final int confirmedPayoutsCount;
  final int unconfirmedPayoutsCount;
  final NextPayoutData nextPayout;
  final MappedPayout? lastPaidPayout;

  const PayoutsUiState({
    required this.status,
    this.payouts = const [],
    required this.confirmedPayoutsCount,
    required this.unconfirmedPayoutsCount,
    required this.nextPayout,
    this.lastPaidPayout,
  });
}
