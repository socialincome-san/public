part of "survey_cubit.dart";

@MappableEnum()
enum SurveyStateStatus {
  initial,
  updatedSuccess,
  updatedFailure,
}

@MappableClass()
class SurveyState with SurveyStateMappable {
  final SurveyStateStatus status;
  final List<MappedSurvey> mappedSurveys;
  final List<MappedSurvey> dashboardMappedSurveys;

  const SurveyState({
    this.status = SurveyStateStatus.initial,
    this.mappedSurveys = const [],
    this.dashboardMappedSurveys = const [],
  });
}
