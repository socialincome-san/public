part of "payments_cubit.dart";

enum PaymentsStatus { initial, loading, success, failure }

class PaymentsState extends Equatable {
  final PaymentsStatus status;
  final List<SocialIncomePayment> payments;
  final Exception? exception;

  const PaymentsState({
    this.status = PaymentsStatus.initial,
    this.payments = const [],
    this.exception,
  });

  @override
  List<Object?> get props => [status, payments, exception];

  PaymentsState copyWith({
    PaymentsStatus? status,
    List<SocialIncomePayment>? payments,
    Exception? exception,
  }) {
    return PaymentsState(
      status: status ?? this.status,
      payments: payments ?? this.payments,
      exception: exception ?? this.exception,
    );
  }
}
