import "package:app/data/model/survey/survey_questionnaire.dart";
import "package:app/data/model/survey/survey_status.dart";
import "package:dart_mappable/dart_mappable.dart";

part "survey.mapper.dart";

@MappableClass()
class Survey with SurveyMappable {
  final String id;
  final String name;
  final String recipientId;
  final String language;
  final String dueAt;
  final String? completedAt;

  final SurveyQuestionnaire questionnaire;
  final SurveyStatus status;

  // TODO: what is this?
  final Object? data;

  final String accessEmail;
  final String accessPw;
  final String accessToken;
  final String? surveyScheduleId;

  final String createdAt;
  final String? updatedAt;

  const Survey({
    required this.id,
    required this.name,
    required this.recipientId,
    required this.questionnaire,
    required this.language,
    required this.dueAt,
    this.completedAt,
    required this.status,
    required this.data,
    required this.accessEmail,
    required this.accessPw,
    required this.accessToken,
    this.surveyScheduleId,
    required this.createdAt,
    this.updatedAt,
  });
}
