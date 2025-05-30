part of "payments_cubit.dart";

enum PaymentsStatus { initial, loading, success, updated, failure }

class PaymentsState extends Equatable {
  final PaymentsStatus status;
  final PaymentsUiState? paymentsUiState;
  final Exception? exception;

  const PaymentsState({this.status = PaymentsStatus.initial, this.paymentsUiState, this.exception});

  @override
  List<Object?> get props => [status, paymentsUiState, exception];

  PaymentsState copyWith({PaymentsStatus? status, PaymentsUiState? paymentsUiState, Exception? exception}) {
    return PaymentsState(
      status: status ?? this.status,
      paymentsUiState: paymentsUiState ?? this.paymentsUiState,
      exception: exception ?? this.exception,
    );
  }
}
