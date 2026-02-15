import "dart:convert";

import "package:app/data/database/app_database.dart" as db;
import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/data/models/survey/survey_questionnaire.dart";
import "package:app/data/models/survey/survey_status.dart";
import "package:drift/drift.dart";

class SurveyLocalDataSource implements SurveyDataSource {
  final db.AppDatabase database;

  SurveyLocalDataSource({required this.database});

  @override
  Future<List<Survey>> fetchSurveys({required String recipientId}) async {
    final surveyRows =
        await (database.select(database.surveys)..where((s) => s.recipientId.equals(recipientId))).get();

    return surveyRows.map((row) {
      return Survey(
        id: row.id,
        name: row.name,
        recipientId: row.recipientId,
        language: row.language,
        dueAt: row.dueAt,
        completedAt: row.completedAt,
        questionnaire: SurveyQuestionnaireMapper.fromValue(row.questionnaireJson),
        status: SurveyStatusMapper.fromValue(row.status),
        surveyScheduleId: row.surveyScheduleId,
        data: row.dataJson != null ? jsonDecode(row.dataJson!) : null,
        accessEmail: row.accessEmail,
        accessPw: row.accessPw,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      );
    }).toList();
  }

  Future<void> saveSurveys(List<Survey> surveys) async {
    if (surveys.isEmpty) return;

    final recipientId = surveys.first.recipientId;

    await database.batch((batch) {
      // Delete surveys for this recipient
      batch.deleteWhere(
        database.surveys,
        (s) => s.recipientId.equals(recipientId),
      );

      for (final survey in surveys) {
        batch.insert(
          database.surveys,
          db.SurveysCompanion.insert(
            id: survey.id,
            recipientId: survey.recipientId,
            name: survey.name,
            language: survey.language,
            dueAt: survey.dueAt,
            completedAt: Value(survey.completedAt),
            questionnaireJson: survey.questionnaire.toValue() as String,
            status: survey.status.toValue() as String,
            surveyScheduleId: Value(survey.surveyScheduleId),
            dataJson: Value(survey.data != null ? jsonEncode(survey.data) : null),
            accessEmail: survey.accessEmail,
            accessPw: survey.accessPw,
            createdAt: survey.createdAt,
            updatedAt: Value(survey.updatedAt),
            cachedAt: DateTime.now(),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }

  Future<void> clearSurveys(String recipientId) async {
    await (database.delete(database.surveys)..where((s) => s.recipientId.equals(recipientId))).go();
  }
}
