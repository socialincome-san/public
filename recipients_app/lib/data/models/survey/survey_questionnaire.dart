import "package:dart_mappable/dart_mappable.dart";

part "survey_questionnaire.mapper.dart";

@MappableEnum()
enum SurveyQuestionnaire {
  onboarding,
  checkin,
  offboarding,
  @MappableValue("offboarded_checkin")
  offboardedCheckin,
}
