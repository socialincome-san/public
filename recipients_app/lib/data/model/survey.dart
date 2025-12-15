import "package:dart_mappable/dart_mappable.dart";

part "survey.mapper.dart";

@MappableClass()
class Survey with SurveyMappable {
  Survey({
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

  String id;

  String name;

  String recipientId;

  String questionnaire;

  String language;

  String dueAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? completedAt;

  String status;

  Object? data;

  String accessEmail;

  String accessPw;

  String accessToken;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? surveyScheduleId;

  String createdAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? updatedAt;
}
