import "package:app/view/widgets/income/balance_card_status.dart";
import "package:app/view/widgets/income/calculated_payment.dart";
import "package:equatable/equatable.dart";

class CalculatedPaymentsUiState extends Equatable {
  final BalanceCardStatus status;
  final List<CalculatedPayment> payments;
  final int paymentsCount;
  final int unconfirmedPaymentsCount;
  final NextPaymentData nextPayment;

  const CalculatedPaymentsUiState({
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

  CalculatedPaymentsUiState copyWith({
    BalanceCardStatus? status,
    List<CalculatedPayment>? payments,
    int? paymentsCount,
    int? unconfirmedPaymentsCount,
    NextPaymentData? nextPayment,
  }) {
    return CalculatedPaymentsUiState(
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
