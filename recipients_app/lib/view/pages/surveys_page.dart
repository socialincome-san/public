import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/survey/survey_list_card.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class SurveysPage extends StatefulWidget {
  const SurveysPage({super.key});

  @override
  State<SurveysPage> createState() => _SurveysPageState();
}

class _SurveysPageState extends State<SurveysPage> {
  final _refreshIndicatorKey = GlobalKey<RefreshIndicatorState>();

  @override
  Widget build(BuildContext context) {
    final mappedSurveys = context.watch<SurveyCubit>().state.mappedSurveys;

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(context.l10n.surveysTitle),
        leading: BackButton(
          onPressed: () {
            context.read<SurveyCubit>().getSurveys();
            Navigator.maybePop(context);
          },
        ),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: () => context.read<SurveyCubit>().getSurveys(),
        child: Padding(
          padding: AppSpacings.h8,
          child: Column(
            children: [
              if (mappedSurveys.isEmpty)
                Expanded(
                  child: Padding(
                    padding: AppSpacings.a8,
                    child: Center(child: Text(context.l10n.surveysEmpty, textAlign: TextAlign.center)),
                  ),
                )
              else
                Expanded(
                  child: ListView.builder(
                    itemCount: mappedSurveys.length,
                    itemBuilder: (context, index) {
                      return SurveyListCard(mappedSurvey: mappedSurveys[index]);
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
