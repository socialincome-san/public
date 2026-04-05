import "package:dart_mappable/dart_mappable.dart";

part "survey_status.mapper.dart";

@MappableEnum()
enum SurveyStatus {
  @MappableValue("new")
  created,
  sent,
  scheduled,
  @MappableValue("in_progress")
  inProgress,
  completed,
  missed,
}
