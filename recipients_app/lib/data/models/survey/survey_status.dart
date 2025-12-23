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

// OLD
/* @MappableEnum()
enum SurveyServerStatus {
  @MappableValue("created")
  created,
  @MappableValue("sent")
  sent,
  @MappableValue("scheduled")
  scheduled,
  @MappableValue("in-progress")
  inProgress,
  @MappableValue("completed")
  completed,
  @MappableValue("missed")
  missed,
} */
