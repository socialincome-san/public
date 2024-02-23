import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/models/models.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_sizes.dart";
import "package:app/view/pages/surveys_page.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

const _doneStatuses = [
  SurveyCardStatus.missed,
  SurveyCardStatus.answered,
];

class SurveysOverviewCard extends DashboardItem {
  final List<MappedSurvey> mappedSurveys;

  const SurveysOverviewCard({super.key, required this.mappedSurveys});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return GestureDetector(
      onTap: () => _navigateToSurveysPage(context),
      child: Card(
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
                        localizations.mySurveysTitle,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.black,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        localizations.completedSurveysCount(
                          _getDoneSurveysCount(),
                          mappedSurveys.length,
                        ),
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.darkGrey,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(width: AppSizes.small),
                  ButtonSmall(
                    onPressed: () => _navigateToSurveysPage(context),
                    label: localizations.overview,
                    buttonType: ButtonSmallType.outlined,
                    color: AppColors.fontColorDark,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  _navigateToSurveysPage(BuildContext context) {
    final surveyCubit = context.read<SurveyCubit>();

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => BlocProvider.value(
          value: surveyCubit,
          child: const SurveysPage(),
        ),
      ),
    );
  }

  int _getDoneSurveysCount() {
    return mappedSurveys.fold(
      0,
      (acc, element) {
        if (_doneStatuses.contains(element.cardStatus))
          return acc + 1;
        else
          return acc;
      },
    );
  }
}
