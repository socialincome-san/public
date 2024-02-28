import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/models/models.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_sizes.dart";
import "package:app/view/pages/survey_page.dart";
import "package:app/view/widgets/survey/survey_card_bottom_action.dart";
import "package:app/view/widgets/survey/survey_status_chip.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";
import "package:intl/intl.dart";

const _kOpenableSurveyStatuses = [
  SurveyCardStatus.newSurvey,
  SurveyCardStatus.firstReminder,
  SurveyCardStatus.overdue,
];

class SurveyListCard extends StatelessWidget {
  final MappedSurvey mappedSurvey;

  const SurveyListCard({super.key, required this.mappedSurvey});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final locale = Localizations.localeOf(context).toLanguageTag();

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      mappedSurvey.name,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.black,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(
                        mappedSurvey.survey.dueDateAt?.toDate(),
                        localizations,
                        locale,
                      ),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.darkGrey,
                          ),
                    ),
                  ],
                ),
                const SizedBox(width: AppSizes.small),
                SurveyServerStatusChip(
                  status: mappedSurvey.cardStatus,
                  serverStatus: mappedSurvey.survey.status,
                ),
              ],
            ),
          ),
          if (_kOpenableSurveyStatuses.contains(mappedSurvey.cardStatus)) ...[
            SurveyCardBottomAction(mappedSurvey: mappedSurvey),
          ],
        ],
      ),
    );
  }

  String _formatDate(
    DateTime? dateTime,
    AppLocalizations localizations,
    String locale,
  ) {
    if (dateTime == null) return "";

    return DateFormat.yMd(locale).format(dateTime);
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
}
