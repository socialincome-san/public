import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/models/survey/survey_card_status.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/survey_status_icon_with_text.dart";
import "package:app/view/pages/impact_measurement_page.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";

class SurveyCardBottomAction extends StatelessWidget {
  final MappedSurvey mappedSurvey;
  final SurveyCubit surveyCubit;

  const SurveyCardBottomAction({
    super.key,
    required this.mappedSurvey,
    required this.surveyCubit,
  });

  @override
  Widget build(BuildContext context) {
    final foregroundColor = _getForegroundColor(mappedSurvey.cardStatus);

    return Container(
      color: _getBackgroundColor(mappedSurvey.cardStatus),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                _getStatusLabel(mappedSurvey),
                style: TextStyle(color: foregroundColor),
              ),
            ),
            if (_shouldShowActionButton(mappedSurvey.cardStatus)) ...[
              ButtonSmall(
                onPressed: () {
                  _navigateToSurvey(context, surveyCubit);
                },
                label: "Start Survey",
                buttonType: ButtonSmallType.outlined,
                color: foregroundColor,
                fontColor: foregroundColor,
              ),
            ] else if (mappedSurvey.cardStatus == SurveyCardStatus.answered) ...[
              const SurveyStatusIconWithText(
                status: SurveyCardStatus.answered,
                text: "Answered",
              ),
            ] else if (mappedSurvey.cardStatus == SurveyCardStatus.missed) ...[
              const SurveyStatusIconWithText(
                status: SurveyCardStatus.missed,
                text: "Missed survey",
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _navigateToSurvey(BuildContext context, SurveyCubit surveyCubit) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BlocProvider.value(
          value: surveyCubit,
          child: SurveyPage(mappedSurvey: mappedSurvey),
        ),
      ),
    );
  }

  bool _shouldShowActionButton(
    SurveyCardStatus status,
  ) {
    return status != SurveyCardStatus.answered &&
        status != SurveyCardStatus.missed;
  }

  Color _getBackgroundColor(SurveyCardStatus status) {
    switch (status) {
      case SurveyCardStatus.missed:
        return AppColors.redColor;
      case SurveyCardStatus.closeToDeadline:
        return AppColors.yellowColor;
      case SurveyCardStatus.answered:
      case SurveyCardStatus.firstReminder:
        return AppColors.primaryColor;
      case SurveyCardStatus.newSurvey:
        return Colors.white;
    }
  }

  Color _getForegroundColor(SurveyCardStatus status) {
    switch (status) {
      case SurveyCardStatus.missed:
        return AppColors.fontColorDark;
      case SurveyCardStatus.closeToDeadline:
        return AppColors.fontColorDark;
      case SurveyCardStatus.answered:
      case SurveyCardStatus.firstReminder:
        return Colors.white;
      case SurveyCardStatus.newSurvey:
        return AppColors.fontColorDark;
    }
  }

  String _getStatusLabel(MappedSurvey mappedSurvey) {
    switch (mappedSurvey.cardStatus) {
      case SurveyCardStatus.answered:
        return DateFormat("dd.MM.yyyy")
            .format(mappedSurvey.survey.completedAt?.toDate() ?? DateTime.now());
      case SurveyCardStatus.closeToDeadline:
      case SurveyCardStatus.firstReminder:
      case SurveyCardStatus.newSurvey:
        return "You have ${mappedSurvey.daysToDeadline} days to answer.";
      case SurveyCardStatus.missed:
        return "";
    }
  }
}
