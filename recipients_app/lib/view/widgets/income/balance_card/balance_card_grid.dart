import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/ui/icons/payment_status_icon.dart";
import "package:flutter/material.dart";

const kMonthsPerYear = 12;

class BalanceCardGrid extends StatelessWidget {
  final List<MappedPayout> payments;
  final int programTotalCountOfPayments;

  const BalanceCardGrid({
    super.key,
    required this.payments,
    required this.programTotalCountOfPayments,
  });

  @override
  Widget build(BuildContext context) {
    final paymentsStartingFromOldest = payments.toList();
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: kMonthsPerYear,
      crossAxisSpacing: 6,
      mainAxisSpacing: 6,
      physics: const NeverScrollableScrollPhysics(),
      children: List.generate(
        programTotalCountOfPayments,
        (index) {
          if (index < paymentsStartingFromOldest.length) {
            final payment = paymentsStartingFromOldest[index];
            return PaymentStatusIcon(
              status: payment.uiStatus,
            );
          }

          if (!paymentsStartingFromOldest.any(
                (element) => element.uiStatus == PayoutUiStatus.toBePaid,
              ) &&
              index == (paymentsStartingFromOldest.length)) {
            return const PaymentStatusIcon(
              status: PayoutUiStatus.toBePaid,
            );
          }

          return const PaymentStatusIcon(status: PayoutUiStatus.empty);
        },
      ),
    );
  }
}
