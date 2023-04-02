import "package:app/data/models/payment/payment.dart";
import "package:app/ui/configs/configs.dart";
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
      // blue label, white font, confirm icon
      case PaymentUiStatus.confirmed:
        color = AppColors.primaryColor;
        icon = Icons.check_rounded;
        textColor = Colors.white;
        break;
      // blue label, white font, question mark icon
      case PaymentUiStatus.recentToReview:
        color = AppColors.primaryColor;
        icon = Icons.question_mark_rounded;
        textColor = Colors.white;
        break;
      // red label, dark font, close icon
      case PaymentUiStatus.onHoldContested:
      case PaymentUiStatus.onHoldToReview:
        color = AppColors.redColor;
        icon = Icons.close_rounded;
        textColor = AppColors.fontColorDark;
        iconColor = AppColors.fontColorDark;
        break;
      // yellow label, dark font, warning icon
      case PaymentUiStatus.toReview:
      case PaymentUiStatus.contested:
        color = AppColors.yellowColor;
        icon = Icons.priority_high_rounded;
        textColor = AppColors.fontColorDark;
        iconColor = AppColors.fontColorDark;
        break;
      // grey label, dark font, timer icon
      case PaymentUiStatus.toBePaid:
        color = AppColors.lightGrey;
        icon = Icons.timer_outlined;
        textColor = AppColors.fontColorDark;
        iconColor = AppColors.fontColorDark;
        break;
      case PaymentUiStatus.empty:
      // // TODO: Handle this case.
    }

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
