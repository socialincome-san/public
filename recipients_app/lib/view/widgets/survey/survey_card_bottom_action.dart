import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/models/survey/mapped_survey.dart";
import "package:app/data/models/survey/survey_card_status.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/survey_status_icon_with_text.dart";
import "package:app/view/pages/survey_page.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

class SurveyCardBottomAction extends StatelessWidget {
  final MappedSurvey mappedSurvey;

  const SurveyCardBottomAction({
    super.key,
    required this.mappedSurvey,
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
                onPressed: () => _navigateToSurvey(context),
                label: "Start Survey",
                buttonType: ButtonSmallType.outlined,
                color: foregroundColor,
                fontColor: foregroundColor,
              ),
            ] else if (mappedSurvey.cardStatus ==
                SurveyCardStatus.answered) ...[
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

  void _navigateToSurvey(BuildContext context) {
    final surveyCubit = context.read<SurveyCubit>();

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
      case SurveyCardStatus.overdue:
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
      case SurveyCardStatus.overdue:
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
        return DateFormat("dd.MM.yyyy").format(
            mappedSurvey.survey.completedAt?.toDate() ?? DateTime.now());
      case SurveyCardStatus.overdue:
        final daysAfterOverdue = mappedSurvey.daysAfterOverdue ?? 0;
        var daysText = "day";
        if (daysAfterOverdue > 1) {
          daysText += "s";
        }
        return "$daysAfterOverdue $daysText overdue";
      case SurveyCardStatus.firstReminder:
      case SurveyCardStatus.newSurvey:
        final daysToOverdue = mappedSurvey.daysToOverdue ?? 0;
        var daysText = "day";
        if (daysToOverdue > 1) {
          daysText += "s";
        }
        return "You have $daysToOverdue $daysText to answer";
      case SurveyCardStatus.missed:
        return "";
    }
  }
}