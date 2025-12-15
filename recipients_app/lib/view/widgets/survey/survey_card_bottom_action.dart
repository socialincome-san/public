import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/core/helpers/string_extensions.dart";
import "package:app/data/model/survey/mapped_survey.dart";
import "package:app/data/model/survey/survey_card_status.dart";
import "package:app/l10n/arb/app_localizations.dart";
import "package:app/l10n/l10n.dart";
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
    final locale = Localizations.localeOf(context).toLanguageTag();
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
                _getStatusLabel(mappedSurvey, context.l10n, locale),
                style: TextStyle(color: foregroundColor),
              ),
            ),
            if (_shouldShowActionButton(mappedSurvey.cardStatus)) ...[
              ButtonSmall(
                onPressed: () => _navigateToSurvey(context),
                label: context.l10n.startSurvey,
                buttonType: ButtonSmallType.outlined,
                color: foregroundColor,
                fontColor: foregroundColor,
              ),
            ] else if (mappedSurvey.cardStatus == SurveyCardStatus.answered) ...[
              SurveyStatusIconWithText(
                status: SurveyCardStatus.answered,
                text: context.l10n.surveyStatusAnswered,
              ),
            ] else if (mappedSurvey.cardStatus == SurveyCardStatus.missed) ...[
              SurveyStatusIconWithText(
                status: SurveyCardStatus.missed,
                text: context.l10n.surveyStatusMissed,
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
    return status != SurveyCardStatus.answered && status != SurveyCardStatus.missed;
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
      case SurveyCardStatus.upcoming:
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
      case SurveyCardStatus.upcoming:
        return AppColors.fontColorDark;
    }
  }

  String _getStatusLabel(
    MappedSurvey mappedSurvey,
    AppLocalizations localizations,
    String locale,
  ) {
    var daysText = localizations.day;

    switch (mappedSurvey.cardStatus) {
      case SurveyCardStatus.answered:
        return DateFormat.yMd(locale).format(
          mappedSurvey.survey.completedAt?.toDateTime() ?? DateTime.now(),
        );
      case SurveyCardStatus.overdue:
        final daysAfterOverdue = mappedSurvey.daysAfterOverdue ?? 0;
        if (daysAfterOverdue > 1) {
          daysText = localizations.days;
        }
        return "$daysAfterOverdue $daysText ${localizations.overdue}";
      case SurveyCardStatus.firstReminder:
      case SurveyCardStatus.newSurvey:
        final daysToOverdue = mappedSurvey.daysToOverdue ?? 0;
        if (daysToOverdue > 1) {
          daysText = localizations.days;
        }
        return localizations.surveyDaysLeft(daysToOverdue, daysText);
      case SurveyCardStatus.missed:
      case SurveyCardStatus.upcoming:
        return "";
    }
  }
}
