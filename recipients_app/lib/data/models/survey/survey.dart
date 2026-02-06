import "package:app/data/models/survey/survey_questionnaire.dart";
import "package:app/data/models/survey/survey_status.dart";
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
  final String? surveyScheduleId;
  // TODO(migration): what is this?
  final Object? data;
  final String accessEmail;
  final String accessPw;
  final String createdAt;
  final String? updatedAt;

  const Survey({
    required this.id,
    required this.name,
    required this.recipientId,
    required this.language,
    required this.dueAt,
    this.completedAt,
    required this.questionnaire,
    required this.status,
    this.surveyScheduleId,
    required this.data,
    required this.accessEmail,
    required this.accessPw,
    required this.createdAt,
    this.updatedAt,
  });
}
