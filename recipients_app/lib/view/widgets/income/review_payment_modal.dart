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
    return FractionallySizedBox(
      widthFactor: 0.9,
      heightFactor: 0.8,
      child: Center(
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
            color: AppColors.backgroundColor,
            border: Border.all(
              color: Theme.of(context).primaryColor,
            ),
          ),
          child: Padding(
            padding: AppSpacings.a16,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Contest payment"),
                    GestureDetector(
                      onTap: () {
                        Navigator.pop(context);
                      },
                      child: const CircleAvatar(
                        radius: 14,
                        backgroundColor: AppColors.lightGrey,
                        child: Icon(
                          size: 18,
                          Icons.close,
                          color: AppColors.fontColorDark,
                        ),
                      ),
                    ),
                  ],
                ),
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 24),
                    child: Text(
                      "A payment has not reached you. What happened?",
                      textAlign: TextAlign.center,
                      style: AppStyles.headlineLarge
                          .copyWith(color: AppColors.primaryColor),
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
          ),
        ),
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
