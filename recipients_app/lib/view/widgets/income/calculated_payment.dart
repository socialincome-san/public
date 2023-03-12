import "package:app/data/models/social_income_payment.dart";
import "package:app/view/widgets/income/calculated_payment_status.dart";
import "package:equatable/equatable.dart";

class CalculatedPayment extends Equatable {
  final SocialIncomePayment payment;
  final CalculatedPaymentStatus status;

  const CalculatedPayment({
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

  CalculatedPayment copyWith({
    SocialIncomePayment? payment,
    CalculatedPaymentStatus? status,
  }) {
    return CalculatedPayment(
      status: status ?? this.status,
      payment: payment ?? this.payment,
    );
  }
}
