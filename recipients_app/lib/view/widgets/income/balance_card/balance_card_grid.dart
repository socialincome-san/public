import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/mapped_payment.dart";
import "package:app/data/models/payment/payment_ui_status.dart";
import "package:app/ui/icons/payment_status_icon.dart";
import "package:flutter/material.dart";

const kMonthsPerYear = 12;

class BalanceCardGrid extends StatelessWidget {
  final List<MappedPayment> payments;

  const BalanceCardGrid({super.key, required this.payments});

  @override
  Widget build(BuildContext context) {
    final paymentsFromOldest = payments.reversed.toList();
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: kMonthsPerYear,
      crossAxisSpacing: 6,
      mainAxisSpacing: 6,
      physics: const NeverScrollableScrollPhysics(),
      children: List.generate(kProgramDurationMonths, (index) {
        if (index < paymentsFromOldest.length) {
          final payment = paymentsFromOldest[index];
          return PaymentStatusIcon(status: payment.uiStatus);
        }

        if (!paymentsFromOldest.any((element) => element.uiStatus == PaymentUiStatus.toBePaid) &&
            index == (paymentsFromOldest.length)) {
          return const PaymentStatusIcon(status: PaymentUiStatus.toBePaid);
        }

        return const PaymentStatusIcon(status: PaymentUiStatus.empty);
      }),
    );
  }
}
