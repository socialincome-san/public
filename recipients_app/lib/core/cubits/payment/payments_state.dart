part of "payments_cubit.dart";

enum PaymentsStatus { initial, loading, success, failure }

class PaymentsState extends Equatable {
  final PaymentsStatus status;
  final PaymentsUiState? paymentsUiState;
  final List<SocialIncomePayment> payments;
  final Exception? exception;

  const PaymentsState({
    this.status = PaymentsStatus.initial,
    this.paymentsUiState,
    this.payments = const [],
    this.exception,
  });

  @override
  List<Object?> get props => [status, paymentsUiState, payments, exception];

  PaymentsState copyWith({
    PaymentsStatus? status,
    PaymentsUiState? paymentsUiState,
    List<SocialIncomePayment>? payments,
    Exception? exception,
  }) {
    return PaymentsState(
      status: status ?? this.status,
      paymentsUiState: paymentsUiState ?? this.paymentsUiState,
      payments: payments ?? this.payments,
      exception: exception ?? this.exception,
    );
  }
}
