import "package:app/data/models/payment/mapped_payment.dart";
import "package:app/data/models/payment/payment_ui_status.dart";
import "package:app/view/widgets/income/payment_status_icon.dart";
import "package:flutter/material.dart";

const kMaxMonths = 36;
const kMonthsPerYear = 12;

class BalanceCardGrid extends StatelessWidget {
  final List<MappedPayment> payments;

  const BalanceCardGrid({
    super.key,
    required this.payments,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: kMonthsPerYear,
      crossAxisSpacing: 6,
      mainAxisSpacing: 6,
      children: List.generate(
        kMaxMonths,
        (index) {
          if (index < payments.length) {
            final payment = payments[index];
            return PaymentStatusIcon(
              status: payment.uiStatus,
            );
          }

          if (!payments.any(
                (element) => element.uiStatus == PaymentUiStatus.toBePaid,
              ) &&
              index == (payments.length)) {
            return const PaymentStatusIcon(
              status: PaymentUiStatus.toBePaid,
            );
          }

          return const PaymentStatusIcon(status: PaymentUiStatus.empty);
        },
      ),
    );
  }
}
