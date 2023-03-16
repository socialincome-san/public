import "package:app/data/models/payment/payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

const statusIconRadius = 10.0;

class PaymentStatusIcon extends StatelessWidget {
  final PaymentUiStatus status;
  final bool isInverted;

  const PaymentStatusIcon({
    super.key,
    required this.status,
    this.isInverted = false,
  });

  @override
  Widget build(BuildContext context) {
    late Color backgroundColor;
    late IconData icon;
    late Color iconColor;

    switch (status) {
      case PaymentUiStatus.confirmed:
        backgroundColor = isInverted ? Colors.white : AppColors.primaryColor;
        icon = Icons.check;
        iconColor = isInverted ? AppColors.primaryColor : Colors.white;
        break;
      case PaymentUiStatus.contested:
        backgroundColor = isInverted ? Colors.white : AppColors.redColor;
        icon = Icons.close;
        iconColor = isInverted ? AppColors.redColor : Colors.white;
        break;
      case PaymentUiStatus.toReview:
        backgroundColor = isInverted ? Colors.white : AppColors.primaryColor;
        icon = Icons.question_mark;
        iconColor = isInverted ? AppColors.primaryColor : Colors.white;
        break;
      case PaymentUiStatus.onHold:
        backgroundColor = isInverted ? Colors.white : AppColors.yellowColor;
        icon = Icons.warning;
        iconColor = isInverted ? AppColors.yellowColor : Colors.white;
        break;
      case PaymentUiStatus.toBePaid:
        backgroundColor = isInverted ? Colors.white : AppColors.lightGrey;
        icon = Icons.info;
        iconColor = isInverted ? AppColors.lightGrey : Colors.white;
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
