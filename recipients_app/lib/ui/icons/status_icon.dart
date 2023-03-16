import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/icons.dart";
import "package:flutter/material.dart";

const statusIconRadius = 10.0;

class StatusIcon extends StatelessWidget {
  final Status status;
  final bool isInverted;

  const StatusIcon({
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
      case Status.success:
        backgroundColor = isInverted ? Colors.white : AppColors.primaryColor;
        icon = Icons.check;
        iconColor = isInverted ? AppColors.primaryColor : Colors.white;
        break;
      case Status.warning:
        backgroundColor = isInverted ? Colors.white : AppColors.yellowColor;
        icon = Icons.warning;
        iconColor = isInverted ? AppColors.yellowColor : Colors.white;
        break;
      case Status.error:
        backgroundColor = isInverted ? Colors.white : AppColors.redColor;
        icon = Icons.close;
        iconColor = isInverted ? AppColors.redColor : Colors.white;
        break;
      case Status.info:
        backgroundColor = isInverted ? Colors.white : AppColors.lightGrey;
        icon = Icons.info;
        iconColor = isInverted ? AppColors.lightGrey : Colors.white;
        break;
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
