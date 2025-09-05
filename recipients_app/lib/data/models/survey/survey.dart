import "package:cloud_firestore/cloud_firestore.dart";
import "package:dart_mappable/dart_mappable.dart";

part "survey.mapper.dart";

// @JsonSerializable()
// @TimestampConverter()
@MappableClass()
class Survey with SurveyMappable {
  // @JsonKey(defaultValue: "")
  final String id;
  final SurveyServerStatus? status;
  // @JsonKey(name: "due_date_at")
  final Timestamp? dueDateAt;
  // @JsonKey(name: "completed_at")
  final Timestamp? completedAt;
  // @JsonKey(name: "access_email")
  final String? accessEmail;
  // @JsonKey(name: "access_pw")
  final String? accessPassword;

  const Survey({
    required this.id,
    this.status,
    this.dueDateAt,
    this.completedAt,
    this.accessEmail,
    this.accessPassword,
  });
}

@MappableEnum()
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
}
