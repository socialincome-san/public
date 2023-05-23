import "package:app/data/models/survey/survey.dart";
import "package:app/data/models/survey/survey_card_status.dart";
import "package:equatable/equatable.dart";

class MappedSurvey extends Equatable {
  final Survey survey;
  final String surveyUrl;
  final SurveyCardStatus cardStatus;
  final int? daysToOverdue;
  final int? daysAfterOverdue;

  MappedSurvey({
    required this.survey,
    required this.surveyUrl,
    required this.cardStatus,
    required this.daysToOverdue,
    required this.daysAfterOverdue,
  });

  @override
  List<Object?> get props => [survey, surveyUrl, cardStatus, daysToOverdue];
}
