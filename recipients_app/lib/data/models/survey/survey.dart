import "package:app/core/helpers/timestamp_converter.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:equatable/equatable.dart";
import "package:json_annotation/json_annotation.dart";

part "survey.g.dart";

@JsonSerializable()
@TimestampConverter()
class Survey extends Equatable {
  @JsonKey(defaultValue: "")
  final String id;
  final SurveyServerStatus? status;
  @JsonKey(name: "due_date_at")
  final Timestamp? dueDateAt;
  @JsonKey(name: "completed_at")
  final Timestamp? completedAt;
  @JsonKey(name: "access_email")
  final String? accessEmail;
  @JsonKey(name: "access_pw")
  final String? accessPassword;

  const Survey({
    required this.id,
    this.status,
    this.dueDateAt,
    this.completedAt,
    this.accessEmail,
    this.accessPassword,
  });

  @override
  List<Object?> get props {
    return [id, status, dueDateAt, completedAt, accessEmail, accessPassword];
  }

  factory Survey.fromJson(Map<String, dynamic> json) => _$SurveyFromJson(json);

  Map<String, dynamic> toJson() => _$SurveyToJson(this);

  Survey copyWith({
    String? id,
    SurveyServerStatus? status,
    Timestamp? dueDateAt,
    Timestamp? completedAt,
    String? accessEmail,
    String? accessPassword,
  }) {
    return Survey(
      id: id ?? this.id,
      status: status ?? this.status,
      dueDateAt: dueDateAt ?? this.dueDateAt,
      completedAt: completedAt ?? this.completedAt,
      accessEmail: accessEmail ?? this.accessEmail,
      accessPassword: accessPassword ?? this.accessPassword,
    );
  }
}

enum SurveyServerStatus {
  @JsonValue("new")
  created,
  @JsonValue("sent")
  sent,
  @JsonValue("scheduled")
  scheduled,
  @JsonValue("in-progress")
  inProgress,
  @JsonValue("completed")
  completed,
  @JsonValue("missed")
  missed,
}
