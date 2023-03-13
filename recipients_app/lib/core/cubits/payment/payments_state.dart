part of "payments_cubit.dart";

enum PaymentsStatus { initial, loading, success, failure }

class PaymentsState extends Equatable {
  final PaymentsStatus status;
  final PaymentsUiState? calculatedPaymentsUiState;
  final Exception? exception;

  const PaymentsState({
    this.status = PaymentsStatus.initial,
    this.calculatedPaymentsUiState,
    this.exception,
  });

  @override
  List<Object?> get props => [status, calculatedPaymentsUiState, exception];

  PaymentsState copyWith({
    PaymentsStatus? status,
    PaymentsUiState? calculatedPaymentsUiState,
    Exception? exception,
  }) {
    return PaymentsState(
      status: status ?? this.status,
      calculatedPaymentsUiState:
          calculatedPaymentsUiState ?? this.calculatedPaymentsUiState,
      exception: exception ?? this.exception,
    );
  }
}
