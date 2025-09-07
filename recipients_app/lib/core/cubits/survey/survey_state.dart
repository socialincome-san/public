part of "survey_cubit.dart";

enum Status { initial, updatedSuccess, updatedFailure }

@MappableClass()
class SurveyState with SurveyStateMappable {
  final Status status;
  final List<MappedSurvey> mappedSurveys;
  final List<MappedSurvey> dashboardMappedSurveys;

  const SurveyState({
    this.status = Status.initial,
    this.mappedSurveys = const [],
    this.dashboardMappedSurveys = const [],
  });
}
