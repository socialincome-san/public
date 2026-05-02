import "package:dart_mappable/dart_mappable.dart";

part "survey_card_status.mapper.dart";

@MappableEnum()
enum SurveyCardStatus {
  newSurvey,
  firstReminder,
  overdue,
  answered,
  missed,
  upcoming,
}
