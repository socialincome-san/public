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
    return Container(
      height: MediaQuery.of(context).size.height * 0.15,
      color: Colors.white,
      child: Row(
        children: [
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: AppSpacings.h8,
                  child: Text(
                    "${payment.currency} ${f.format(payment.amount)}",
                    textScaleFactor: 1.5,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 8.0, left: 8.0),
                  child: Text(_getPaymentStatusText()),
                ),
                if (payment.status == PaymentStatus.contested)
                  const Padding(
                    padding: EdgeInsets.only(left: 8.0),
                    child: Text(
                      "We will reach out to you soon",
                      style: TextStyle(fontStyle: FontStyle.italic),
                    ),
                  )
              ],
            ),
          ),
          if (payment.status != PaymentStatus.confirmed)
            Padding(
              padding: AppSpacings.a16,
              child: ButtonBig(
                label: "Review",
                onPressed: () {
                  final paymentsCubit = context.read<PaymentsCubit>();
                  showModalBottomSheet(
                    isScrollControlled: true,
                    context: context,
                    builder: (context) => BlocProvider.value(
                      value: paymentsCubit,
                      child: ReviewPaymentModal(payment),
                    ),
                  );
                },
              ),
            )
        ],
      ),
    );
  }

  String _cleanStatus(PaymentStatus? currentStatus) {
    return currentStatus != null &&
            [PaymentStatus.confirmed, PaymentStatus.contested]
                .contains(currentStatus)
        ? currentStatus.name
        : "please review this payment";
  }

  String _getPaymentStatusText() {
    return _cleanStatus(payment.status);
  }
}
