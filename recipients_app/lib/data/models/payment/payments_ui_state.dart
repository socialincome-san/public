import "package:app/data/models/payment/payment.dart";
import "package:dart_mappable/dart_mappable.dart";

part "payments_ui_state.mapper.dart";

@MappableClass()
class PaymentsUiState with PaymentsUiStateMappable {
  final BalanceCardStatus status;
  final List<MappedPayment> payments;
  final int confirmedPaymentsCount;
  final int unconfirmedPaymentsCount;
  final NextPaymentData nextPayment;
  final MappedPayment? lastPaidPayment;

  const PaymentsUiState({
    required this.status,
    this.payments = const [],
    required this.confirmedPaymentsCount,
    required this.unconfirmedPaymentsCount,
    required this.nextPayment,
    this.lastPaidPayment,
  });
}
