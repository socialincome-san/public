part of "payouts_cubit.dart";

@MappableEnum()
enum PayoutsStatus {
  initial,
  loading,
  success,
  updated,
  failure,
}

@MappableClass()
class PayoutsState with PayoutsStateMappable {
  final PayoutsStatus status;
  final PayoutsUiState? payoutsUiState;
  final Exception? exception;

  const PayoutsState({
    this.status = PayoutsStatus.initial,
    this.payoutsUiState,
    this.exception,
  });
}
