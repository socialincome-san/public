part of "survey_cubit.dart";

enum SurveyStatus { initial, updatedSuccess, updatedFailure }

class SurveyState extends Equatable {
  final SurveyStatus status;
  final List<MappedSurvey> mappedSurveys;
  final List<MappedSurvey> dashboardMappedSurveys;

  const SurveyState({
    this.status = SurveyStatus.initial,
    this.mappedSurveys = const [],
    this.dashboardMappedSurveys = const [],
  });

  @override
  List<Object?> get props => [status, mappedSurveys, dashboardMappedSurveys];
}
