import "package:app/data/models/payment/payment_ui_status.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/icons.dart";
import "package:flutter/material.dart";

const statusIconRadius = 10.0;

class PaymentStatusIcon extends StatelessWidget {
  final PaymentUiStatus status;

  const PaymentStatusIcon({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    late Color backgroundColor;
    late Widget? child;

    switch (status) {
      case PaymentUiStatus.confirmed:
        return const StatusIcon(
          status: Status.success,
        );
      case PaymentUiStatus.empty:
        backgroundColor = AppColors.backgroundColor;
        child = null;
        break;
      case PaymentUiStatus.toReview:
      case PaymentUiStatus.recentToReview:
        backgroundColor = AppColors.yellowColor;
        child = null;
        break;
      case PaymentUiStatus.toBePaid:
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
      case PaymentUiStatus.contested:
        backgroundColor = AppColors.yellowColor;
        child = const Icon(
          size: 14,
          Icons.priority_high_rounded,
          color: AppColors.fontColorDark,
        );
        break;
      case PaymentUiStatus.onHold:
        backgroundColor = AppColors.redColor;
        child = null;
        break;
    }

    return CircleAvatar(
      radius: statusIconRadius,
      backgroundColor: backgroundColor,
      child: child,
    );
  }
}
