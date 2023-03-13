import "package:app/data/models/payment/balance_card_status.dart";
import "package:app/data/models/payment/mapped_payment.dart";
import "package:equatable/equatable.dart";

class PaymentsUiState extends Equatable {
  final BalanceCardStatus status;
  final List<MappedPayment> payments;
  final int paymentsCount;
  final int unconfirmedPaymentsCount;
  final NextPaymentData nextPayment;

  const PaymentsUiState({
    required this.status,
    this.payments = const [],
    required this.paymentsCount,
    required this.unconfirmedPaymentsCount,
    required this.nextPayment,
  });

  @override
  List<Object?> get props {
    return [
      status,
      payments,
      paymentsCount,
      unconfirmedPaymentsCount,
    ];
  }

  PaymentsUiState copyWith({
    BalanceCardStatus? status,
    List<MappedPayment>? payments,
    int? paymentsCount,
    int? unconfirmedPaymentsCount,
    NextPaymentData? nextPayment,
  }) {
    return PaymentsUiState(
      status: status ?? this.status,
      payments: payments ?? this.payments,
      paymentsCount: paymentsCount ?? this.paymentsCount,
      unconfirmedPaymentsCount:
          unconfirmedPaymentsCount ?? this.unconfirmedPaymentsCount,
      nextPayment: nextPayment ?? this.nextPayment,
    );
  }
}

class NextPaymentData extends Equatable {
  final int amount;
  final String currency;
  final int daysToPayment;

  const NextPaymentData({
    required this.amount,
    required this.currency,
    required this.daysToPayment,
  });

  @override
  List<Object?> get props => [
        amount,
        currency,
        daysToPayment,
      ];
}
