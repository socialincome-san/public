part of "survey_cubit.dart";

enum SurveyStatus { initial, updatedSuccess, updatedFailure }

class SurveyState extends Equatable {
  final SurveyStatus status;
  final List<MappedSurvey> mappedSurveys;

  const SurveyState({
    this.status = SurveyStatus.initial,
    this.mappedSurveys = const [],
  });

  @override
  List<Object?> get props => [status, mappedSurveys];
}
