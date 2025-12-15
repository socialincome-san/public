import "package:app/data/model/survey/survey.dart";
import "package:app/data/model/survey/survey_card_status.dart";
import "package:dart_mappable/dart_mappable.dart";

part "mapped_survey.mapper.dart";

@MappableClass()
class MappedSurvey with MappedSurveyMappable {
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
}
