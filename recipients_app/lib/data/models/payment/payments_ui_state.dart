import "package:app/data/models/payment/payment.dart";
import "package:equatable/equatable.dart";

class PaymentsUiState extends Equatable {
  final BalanceCardStatus status;
  final List<MappedPayment> payments;
  final int confirmedPaymentsCount;
  final int unconfirmedPaymentsCount;
  final NextPaymentData nextPayment;

  const PaymentsUiState({
    required this.status,
    this.payments = const [],
    required this.confirmedPaymentsCount,
    required this.unconfirmedPaymentsCount,
    required this.nextPayment,
  });

  @override
  List<Object?> get props {
    return [
      status,
      payments,
      confirmedPaymentsCount,
      unconfirmedPaymentsCount,
      nextPayment,
    ];
  }

  PaymentsUiState copyWith({
    BalanceCardStatus? status,
    List<MappedPayment>? payments,
    int? confirmedPaymentsCount,
    int? unconfirmedPaymentsCount,
    NextPaymentData? nextPayment,
  }) {
    return PaymentsUiState(
      status: status ?? this.status,
      payments: payments ?? this.payments,
      confirmedPaymentsCount:
          confirmedPaymentsCount ?? this.confirmedPaymentsCount,
      unconfirmedPaymentsCount:
          unconfirmedPaymentsCount ?? this.unconfirmedPaymentsCount,
      nextPayment: nextPayment ?? this.nextPayment,
    );
  }
}
