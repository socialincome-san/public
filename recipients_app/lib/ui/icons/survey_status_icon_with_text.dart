import "package:app/data/models/survey/survey_card_status.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

const statusIconHeight = 24.0;

class SurveyStatusIconWithText extends StatelessWidget {
  final SurveyCardStatus status;
  final String text;

  const SurveyStatusIconWithText({
    super.key,
    required this.status,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    late Color color;
    late IconData icon;
    late Color textColor;
    late Color iconColor;
    late Color iconBackgroundColor;

    switch (status) {
      // white font, check blue icon
      case SurveyCardStatus.answered:
        color = Colors.transparent;
        icon = Icons.check;
        textColor = Colors.white;
        iconColor = AppColors.primaryColor;
        iconBackgroundColor = Colors.white;
        break;
      // dark font, close red icon
      case SurveyCardStatus.missed:
        color = Colors.transparent;
        icon = Icons.close;
        textColor = AppColors.fontColorDark;
        iconColor = AppColors.redColor;
        iconBackgroundColor = Colors.white;
        break;
      case SurveyCardStatus.closeToDeadline:
      case SurveyCardStatus.firstReminder:
      case SurveyCardStatus.newSurvey:
        // no impl for now.
        return Container();
    }

    return Container(
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
          const SizedBox(width: 8),
          Container(
            padding: AppSpacings.a4,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(100),
              color: iconBackgroundColor,
            ),
            child: Icon(
              size: 16,
              icon,
              color: iconColor,
            ),
          ),
        ],
      ),
    );
  }
}
