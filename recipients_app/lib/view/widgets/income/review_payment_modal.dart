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
    "Other reason"
  ];

  bool _contested = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: MediaQuery.of(context).viewInsets,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(top: 24, left: 8, right: 8),
              child: Text(
                _contested
                    ? "What happened?"
                    : "Have you received your Social Income?",
                textScaleFactor: 1.3,
              ),
            ),
          ),
          Padding(
            padding: AppSpacings.v16,
            child: _contested
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: _contestReasons.map((String reason) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<PaymentsCubit>().contestPayment(
                                  widget._payment,
                                  reason,
                                );
                            Navigator.pop(context);
                          },
                          child: Text(reason),
                        ),
                      );
                    }).toList(),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          context.read<PaymentsCubit>().confirmPayment(
                                widget._payment,
                              );
                          Navigator.pop(context);
                        },
                        style: ButtonStyle(
                          minimumSize: MaterialStateProperty.all<Size>(
                            const Size(50, 50),
                          ),
                          backgroundColor: MaterialStateProperty.all<Color>(
                            AppColors.primaryColor,
                          ),
                        ),
                        child: const Text("YES"),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _contested = true;
                          });
                        },
                        style: ButtonStyle(
                          minimumSize: MaterialStateProperty.all<Size>(
                            const Size(50, 50),
                          ),
                          backgroundColor: MaterialStateProperty.all<Color>(
                            Colors.red,
                          ),
                        ),
                        child: const Text("NO"),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}
