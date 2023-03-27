import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/icons.dart";
import "package:flutter/material.dart";

const statusIconHeight = 20.0;

class StatusIconWithText extends StatelessWidget {
  final Status status;
  final String text;
  final bool isInverted;
  final Color iconColor;

  const StatusIconWithText({
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
      case Status.success:
        color = AppColors.primaryColor;
        icon = Icons.check;
        textColor = Colors.white;
        break;
      case Status.underReview:
        color = AppColors.primaryColor;
        icon = Icons.question_mark;
        textColor = Colors.white;
        break;
      case Status.warning:
        color = AppColors.yellowColor;
        icon = Icons.priority_high_rounded;
        textColor = AppColors.fontColorDark;
        break;
      case Status.error:
        color = AppColors.redColor;
        icon = Icons.close;
        textColor = AppColors.fontColorDark;
        break;
      case Status.info:
        color = AppColors.lightGrey;
        icon = Icons.timer_outlined;
        textColor = AppColors.fontColorDark;
        iconColor = AppColors.fontColorDark;
        break;
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
          StatusIcon(
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
