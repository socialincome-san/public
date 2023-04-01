import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/social_income_payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class ReviewPaymentModal extends StatefulWidget {
  final SocialIncomePayment _payment;

  const ReviewPaymentModal(this._payment, {super.key});

  @override
  State<ReviewPaymentModal> createState() => _ReviewPaymentModalState();
}

class _ReviewPaymentModalState extends State<ReviewPaymentModal> {
  final List<String> _contestReasons = [
    "Phone stolen",
    "Incorrect amount",
    "Changed phone number",
    "Other reason",
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: MediaQuery.of(context).viewInsets,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Padding(
              padding: EdgeInsets.only(top: 24, left: 8, right: 8),
              child: Text(
                "A payment has not reached you. What happened?",
                textScaleFactor: 1.3,
              ),
            ),
          ),
          Padding(
            padding: AppSpacings.v16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: _contestReasons.map((String reason) {
                return Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: ElevatedButton(
                    onPressed: () => _onPressedContest(context, reason),
                    child: Text(reason),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  void _onPressedContest(BuildContext context, String reason) {
    context.read<PaymentsCubit>().contestPayment(
          widget._payment,
          reason,
        );
    Navigator.pop(context);
  }
}
