import "package:app/data/models/payment/payment.dart";
import "package:equatable/equatable.dart";

class MappedPayment extends Equatable {
  final SocialIncomePayment payment;
  final PaymentUiStatus uiStatus;

  const MappedPayment({required this.payment, required this.uiStatus});

  @override
  List<Object?> get props {
    return [payment, uiStatus];
  }

  MappedPayment copyWith({SocialIncomePayment? payment, PaymentUiStatus? uiStatus}) {
    return MappedPayment(uiStatus: uiStatus ?? this.uiStatus, payment: payment ?? this.payment);
  }
}
