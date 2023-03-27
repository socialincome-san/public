import "package:app/data/models/payment/payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/payment_status_icon.dart";
import "package:flutter/material.dart";

const statusIconHeight = 20.0;

class PaymentStatusIconWithText extends StatelessWidget {
  final PaymentUiStatus status;
  final String text;
  final bool isInverted;
  final Color iconColor;

  const PaymentStatusIconWithText({
    super.key,
    required this.status,
    required this.text,
    this.isInverted = false,
    this.iconColor = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    late Color color;
    late IconData icon;
    late Color textColor;

    Color iconColor = this.iconColor;

    switch (status) {
      case PaymentUiStatus.confirmed:
        color = AppColors.primaryColor;
        icon = Icons.check;
        textColor = Colors.white;
        iconColor = Colors.white;
        break;
      case PaymentUiStatus.recentToReview:
        color = AppColors.primaryColor;
        icon = Icons.question_mark;
        textColor = Colors.white;
        break;
      case PaymentUiStatus.contested:
        color = AppColors.redColor;
        icon = Icons.close;
        textColor = AppColors.fontColorDark;
        iconColor = AppColors.fontColorDark;
        break;
      case PaymentUiStatus.toReview:
        color = AppColors.primaryColor;
        icon = Icons.question_mark;
        textColor = Colors.white;
        break;
      case PaymentUiStatus.onHold:
        color = AppColors.yellowColor;
        icon = Icons.warning;
        textColor = AppColors.fontColorDark;
        break;
      case PaymentUiStatus.toBePaid:
        color = AppColors.lightGrey;
        icon = Icons.timer_outlined;
        textColor = AppColors.fontColorDark;
        iconColor = AppColors.fontColorDark;
        break;
      case PaymentUiStatus.empty:
        // TODO: Handle this case.
        throw UnimplementedError();
    }

    if (isInverted) {
      return Row(
        children: [
          Text(
            text,
            style: AppStyles.iconLabel.copyWith(
              color: textColor,
            ),
          ),
          const SizedBox(width: 4),
          PaymentStatusIcon(
            status: status,
            isInverted: true,
          ),
        ],
      );
    } else {
      return Container(
        padding: AppSpacings.h8,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
        ),
        height: statusIconHeight,
        child: Row(
          children: [
            Text(
              text,
              style: AppStyles.iconLabel.copyWith(
                color: textColor,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              size: 14,
              icon,
              color: iconColor,
            ),
          ],
        ),
      );
    }
  }
}
