import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/icons.dart";
import "package:app/view/widgets/income/calculated_payment_status.dart";
import "package:flutter/material.dart";

const statusIconRadius = 10.0;

class PaymentStatusIcon extends StatelessWidget {
  final CalculatedPaymentStatus status;

  const PaymentStatusIcon({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    late Color backgroundColor;
    late Widget? child;

    switch (status) {
      case CalculatedPaymentStatus.confirmed:
        return const StatusIcon(
          status: Status.success,
        );
      case CalculatedPaymentStatus.empty:
        backgroundColor = AppColors.backgroundColor;
        child = null;
        break;
      case CalculatedPaymentStatus.toReview:
        backgroundColor = AppColors.yellowColor;
        child = null;
        break;
      case CalculatedPaymentStatus.toBePaid:
        backgroundColor = AppColors.backgroundColor;
        child = Stack(
          alignment: AlignmentDirectional.center,
          children: [
            Icon(
              size: 14,
              Icons.circle,
              color: AppColors.primaryColor.withAlpha(150),
            ),
            const Icon(
              size: 8,
              Icons.circle,
              color: AppColors.primaryColor,
            ),
          ],
        );
        break;
      case CalculatedPaymentStatus.contested:
        return const StatusIcon(
          status: Status.warning,
        );
      case CalculatedPaymentStatus.onHold:
        return const StatusIcon(
          status: Status.error,
        );
    }

    return CircleAvatar(
      radius: statusIconRadius,
      backgroundColor: backgroundColor,
      child: child,
    );
  }
}
