import "package:app/data/models/payment/payment_ui_status.dart";
import "package:app/ui/configs/configs.dart";
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
        backgroundColor = AppColors.primaryColor;
        child = const Icon(
          size: 14,
          Icons.check_rounded,
          color: Colors.white,
        );
        break;
      case PaymentUiStatus.empty:
      case PaymentUiStatus.toBePaid:
        backgroundColor = AppColors.backgroundColor;
        child = null;
        break;
      case PaymentUiStatus.toReview:
      case PaymentUiStatus.contested:
        backgroundColor = AppColors.yellowColor;
        child = const Icon(
          size: 14,
          Icons.priority_high_rounded,
          color: Colors.black,
        );
        break;
      case PaymentUiStatus.recentToReview:
        backgroundColor = AppColors.primaryColor;
        child = const Icon(
          size: 14,
          Icons.question_mark_rounded,
          color: Colors.white,
        );
        break;
      case PaymentUiStatus.onHoldToReview:
      case PaymentUiStatus.onHoldContested:
        backgroundColor = AppColors.redColor;
        child = const Icon(
          size: 14,
          Icons.close_rounded,
          color: Colors.black,
        );
        break;
    }

    return CircleAvatar(
      radius: statusIconRadius,
      backgroundColor: backgroundColor,
      child: child,
    );
  }
}
