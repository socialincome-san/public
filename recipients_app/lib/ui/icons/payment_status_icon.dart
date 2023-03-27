import "package:app/data/models/payment/payment.dart";
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
    late IconData icon;
    late Color iconColor;

    switch (status) {
      case PaymentUiStatus.confirmed:
        backgroundColor = AppColors.primaryColor;
        icon = Icons.check;
        iconColor = Colors.white;
        break;
      case PaymentUiStatus.contested:
        backgroundColor = AppColors.redColor;
        icon = Icons.close;
        iconColor = Colors.white;
        break;
      case PaymentUiStatus.toReview:
        backgroundColor = AppColors.primaryColor;
        icon = Icons.question_mark;
        iconColor = Colors.white;
        break;
      case PaymentUiStatus.recentToReview:
        backgroundColor = AppColors.primaryColor;
        icon = Icons.question_mark;
        iconColor = Colors.white;
        break;
      case PaymentUiStatus.onHold:
        backgroundColor = AppColors.yellowColor;
        icon = Icons.priority_high_rounded;
        iconColor = Colors.white;
        break;
      case PaymentUiStatus.toBePaid:
        backgroundColor = AppColors.lightGrey;
        icon = Icons.info;
        iconColor = Colors.white;
        break;
      case PaymentUiStatus.empty:
        throw UnimplementedError();
    }

    return CircleAvatar(
      radius: statusIconRadius,
      backgroundColor: backgroundColor,
      child: Icon(
        size: 14,
        icon,
        color: iconColor,
      ),
    );
  }
}
