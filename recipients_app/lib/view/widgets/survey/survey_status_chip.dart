import "package:app/data/models/survey/survey.dart";
import "package:app/data/models/survey/survey_card_status.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

const statusIconHeight = 26.0;

class SurveyServerStatusChip extends StatelessWidget {
  final SurveyCardStatus status;
  final SurveyServerStatus? serverStatus;

  const SurveyServerStatusChip({super.key, required this.status, required this.serverStatus});

  @override
  Widget build(BuildContext context) {
    late Color color;
    late Color textColor;

    switch (status) {
      case SurveyCardStatus.answered:
        color = AppColors.primaryColor;
        textColor = Colors.white;
      case SurveyCardStatus.missed:
        color = AppColors.redColor;
        textColor = AppColors.fontColorDark;
      case SurveyCardStatus.overdue:
      case SurveyCardStatus.firstReminder:
      case SurveyCardStatus.newSurvey:
        color = AppColors.yellowColor;
        textColor = AppColors.fontColorDark;
      case SurveyCardStatus.upcoming:
        color = AppColors.backgroundColor;
        textColor = AppColors.fontColorDark;
    }

    return Container(
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(AppSizes.radiusMedium)),
      height: statusIconHeight,
      child: Padding(
        padding: AppSpacings.h8v4,
        child: Row(
          children: [
            Text(
              _getStatusName(status, serverStatus, context.l10n),
              style: AppStyles.iconLabel.copyWith(color: textColor),
            ),
          ],
        ),
      ),
    );
  }
}

String _getStatusName(SurveyCardStatus status, SurveyServerStatus? serverStatus, AppLocalizations localizations) {
  final String statusName;
  switch (status) {
    case SurveyCardStatus.newSurvey:
    case SurveyCardStatus.firstReminder:
    case SurveyCardStatus.overdue:
      if (serverStatus != SurveyServerStatus.inProgress) {
        statusName = localizations.surveyDue;
      } else {
        statusName = localizations.surveyInProgress;
      }
    case SurveyCardStatus.answered:
      statusName = localizations.surveyCompleted;
    case SurveyCardStatus.missed:
      statusName = localizations.surveyMissed;
    case SurveyCardStatus.upcoming:
      statusName = localizations.surveyUpcoming;
  }

  return statusName;
}
