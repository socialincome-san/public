import "package:app/data/models/survey/survey.dart";
import "package:app/data/models/survey/survey_card_status.dart";
import "package:equatable/equatable.dart";

class MappedSurvey extends Equatable {
  final String name;
  final Survey survey;
  final String surveyUrl;
  final SurveyCardStatus cardStatus;
  final int? daysToOverdue;
  final int? daysAfterOverdue;

  const MappedSurvey({
    required this.name,
    required this.survey,
    required this.surveyUrl,
    required this.cardStatus,
    required this.daysToOverdue,
    required this.daysAfterOverdue,
  });

  @override
  List<Object?> get props => [name, survey, surveyUrl, cardStatus, daysToOverdue, daysAfterOverdue];
}
