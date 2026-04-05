import "package:app/core/helpers/date_time_converter.dart";
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
  @MappableField(hook: DateTimeHook())
  final DateTime dueAt;
  @MappableField(hook: DateTimeHook())
  final DateTime? completedAt;
  final SurveyQuestionnaire questionnaire;
  final SurveyStatus status;
  final String? surveyScheduleId;
  // TODO(migration): For what should be data used for?
  final Object? data;
  final String accessEmail;
  final String accessPw;
  @MappableField(hook: DateTimeHook())
  final DateTime createdAt;
  @MappableField(hook: DateTimeHook())
  final DateTime? updatedAt;

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
