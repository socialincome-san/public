import "package:equatable/equatable.dart";

class NextPaymentData extends Equatable {
  final int amount;
  final String currency;
  final int daysToPayment;

  const NextPaymentData({required this.amount, required this.currency, required this.daysToPayment});

  @override
  List<Object?> get props => [amount, currency, daysToPayment];
}
