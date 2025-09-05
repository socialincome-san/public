import "package:app/data/models/recipient_main_language.dart";
import "package:app/data/models/survey/survey_questionnaire.dart";
import "package:app/data/models/survey/survey_status.dart";
import "package:dart_mappable/dart_mappable.dart";

part "survey.mapper.dart";

/*
model Survey {
  id            String                @id @default(cuid()) @map("id")
  recipientId   String                @map("recipient_id")
  recipient     Recipient             @relation(fields: [recipientId], references: [id])
  questionnaire SurveyQuestionnaire   @map("questionnaire")
  recipientName String                @map("recipient_name")
  language      RecipientMainLanguage @map("language")
  dueDateAt     DateTime              @map("due_date_at")
  sentAt        DateTime?             @map("sent_at")
  completedAt   DateTime?             @map("completed_at")
  status        SurveyStatus          @map("status")
  comments      String?               @map("comments")
  data          String                @map("data")
  accessEmail   String                @map("access_email")
  accessPw      String                @map("access_pw")
  accessToken   String                @map("access_token")
  programId     String?               @map("program_id")
  program       Program?              @relation(fields: [programId], references: [id])
  createdAt     DateTime              @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt     DateTime?             @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@map("survey")
}
*/
@MappableClass()
class Survey with SurveyMappable {
  final String id;
  final String recipientId;
  final SurveyQuestionnaire questionnaire;
  final String recipientName;
  final RecipientMainLanguage language;
  final DateTime dueDateAt;
  final DateTime? sentAt;
  final DateTime? completedAt;
  final SurveyStatus status;
  final String? comments;
  final String data;
  final String accessEmail;
  final String accessPw;
  final String accessToken;
  // final Program? program;

  const Survey({
    required this.id,
    required this.recipientId,
    required this.questionnaire,
    required this.recipientName,
    required this.language,
    required this.dueDateAt,
    required this.sentAt,
    required this.completedAt,
    required this.status,
    required this.comments,
    required this.data,
    required this.accessEmail,
    required this.accessPw,
    required this.accessToken,
    // required this.program,
  });
}

// OLD
/* import "package:cloud_firestore/cloud_firestore.dart";
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
 */
