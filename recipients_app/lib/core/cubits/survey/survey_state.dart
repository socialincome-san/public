part of "survey_cubit.dart";

enum SurveyStatus { initial, updatedSuccess, updatedFailure }

class SurveyState extends Equatable {
  final SurveyStatus status;
  final String? surveyUrl;
  final DateTime? nextSurveyDate;

  const SurveyState({
    this.status = SurveyStatus.initial,
    this.surveyUrl,
    this.nextSurveyDate,
  });

  @override
  List<Object?> get props => [status, surveyUrl, nextSurveyDate];
}
