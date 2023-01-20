import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/icons.dart";
import "package:flutter/material.dart";

const statusIconHeight = 20.0;

class StatusIconWithText extends StatelessWidget {
  final Status status;
  final String text;
  final bool isInverted;

  const StatusIconWithText({
    super.key,
    required this.status,
    required this.text,
    this.isInverted = false,
  });

  @override
  Widget build(BuildContext context) {
    late Color color;
    late IconData icon;
    late Color textColor;

    switch (status) {
      case Status.success:
        color = AppColors.primaryColor;
        icon = Icons.check;
        textColor = Colors.white;
        break;
      case Status.warning:
        color = AppColors.yellowColor;
        icon = Icons.warning;
        textColor = AppColors.fontColorDark;
        break;
      case Status.error:
        color = AppColors.redColor;
        icon = Icons.close;
        textColor = AppColors.fontColorDark;
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
        padding: const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
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
              color: Colors.white,
            ),
          ],
        ),
      );
    }
  }
}
