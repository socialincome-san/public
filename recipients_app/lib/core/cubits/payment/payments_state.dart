part of "payments_cubit.dart";

enum PaymentsStatus {
  initial,
  loading,
  success,
  updated,
  failure,
}

@MappableClass()
class PaymentsState with PaymentsStateMappable {
  final PaymentsStatus status;
  final PaymentsUiState? paymentsUiState;
  final Exception? exception;

  const PaymentsState({
    this.status = PaymentsStatus.initial,
    this.paymentsUiState,
    this.exception,
  });
}
