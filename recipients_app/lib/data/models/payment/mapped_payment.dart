import "package:app/data/models/payment/mapped_payment_status.dart";
import "package:app/data/models/payment/social_income_payment.dart";
import "package:equatable/equatable.dart";

class MappedPayment extends Equatable {
  final SocialIncomePayment payment;
  final PaymentUiStatus status;

  const MappedPayment({
    required this.payment,
    required this.status,
  });

  @override
  List<Object?> get props {
    return [
      payment,
      status,
    ];
  }

  MappedPayment copyWith({
    SocialIncomePayment? payment,
    PaymentUiStatus? status,
  }) {
    return MappedPayment(
      status: status ?? this.status,
      payment: payment ?? this.payment,
    );
  }
}
