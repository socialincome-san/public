part of "survey_cubit.dart";

enum SurveyStatus { initial, updatedSuccess, updatedFailure }

class SurveyState extends Equatable {
  final SurveyStatus status;
  final String? surveyUrl;
  final DateTime? nextSurveyDate;
  final List<MappedSurvey> mappedSurveys;

  const SurveyState({
    this.status = SurveyStatus.initial,
    this.surveyUrl,
    this.nextSurveyDate,
    this.mappedSurveys = const [],
  });

  @override
  List<Object?> get props => [status, surveyUrl, nextSurveyDate, mappedSurveys];
}
