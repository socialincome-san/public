import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/social_income_payment.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/review_payment_modal.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

String format = ",###,###";
NumberFormat f = NumberFormat(format, "en_US");

class PaymentCard extends StatelessWidget {
  final SocialIncomePayment payment;

  const PaymentCard({
    required this.payment,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      child: Padding(
        padding: AppSpacings.a12,
        child: Row(
          children: [
            Expanded(
              flex: 4,
              child: Padding(
                padding: AppSpacings.v8,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "${payment.currency} ${f.format(payment.amount)}",
                      style:
                          Theme.of(context).textTheme.headlineLarge!.copyWith(
                                color: AppColors.fontColorDark,
                              ),
                      // textScaleFactor: 1.5,
                    ),
                    const SizedBox(height: 8),
                    Text(_cleanStatus(payment.status)),
                    if (payment.status == PaymentStatus.contested)
                      const Text(
                        "We will reach out to you soon",
                        style: TextStyle(fontStyle: FontStyle.italic),
                      ),
                  ],
                ),
              ),
            ),
            if (payment.status != PaymentStatus.confirmed)
              ButtonBig(
                label: "Review",
                onPressed: () => _onPressReview(context),
              ),
          ],
        ),
      ),
    );
  }

  void _onPressReview(BuildContext context) {
    final paymentsCubit = context.read<PaymentsCubit>();
    showModalBottomSheet(
      isScrollControlled: true,
      context: context,
      builder: (context) => BlocProvider.value(
        value: paymentsCubit,
        child: ReviewPaymentModal(payment),
      ),
    );
  }

  String _cleanStatus(PaymentStatus? currentStatus) {
    return currentStatus != null &&
            [PaymentStatus.confirmed, PaymentStatus.contested]
                .contains(currentStatus)
        ? currentStatus.name
        : "Please review this payment";
  }
}
