part of "survey_cubit.dart";

enum SurveyStatus { initial, updatedSuccess, updatedFailure }

@MappableClass()
class SurveyState with SurveyStateMappable {
  final SurveyStatus status;
  final List<MappedSurvey> mappedSurveys;
  final List<MappedSurvey> dashboardMappedSurveys;

  const SurveyState({
    this.status = SurveyStatus.initial,
    this.mappedSurveys = const [],
    this.dashboardMappedSurveys = const [],
  });
}
