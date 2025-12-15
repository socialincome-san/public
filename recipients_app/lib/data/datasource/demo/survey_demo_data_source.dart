import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/model/survey/survey.dart";
import "package:app/data/model/survey/survey_questionnaire.dart";
import "package:app/data/model/survey/survey_status.dart";

class SurveyDemoDataSource implements SurveyDataSource {
  final List<Survey> _surveys = _generateDemoSurveys();

  static List<Survey> _generateDemoSurveys() {
    final now = DateTime.now();
    final surveys = [
      Survey(
        id: "onboarding",
        status: SurveyStatus.scheduled,
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.onboarding,
        language: "en",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
        // new fields
        name: "Demo Recipient",
        dueAt: now.subtract(const Duration(days: 10)).toIso8601String(),
        createdAt: now.toIso8601String(),
      ),
      Survey(
        id: "checkin",
        status: SurveyStatus.scheduled,
        dueAt: now.toIso8601String(),
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.checkin,
        language: "en",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
        // new fields
        name: "Demo Recipient",
        createdAt: now.toIso8601String(),
      ),
      Survey(
        id: "offboarding",
        status: SurveyStatus.scheduled,
        dueAt: now.add(const Duration(days: 11)).toIso8601String(),
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.offboarding,
        language: "en",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
        // new fields
        name: "Demo Recipient",
        createdAt: now.toIso8601String(),
      ),
      Survey(
        id: "followup",
        status: SurveyStatus.scheduled,
        dueAt: DateTime.now().add(const Duration(days: 16)).toIso8601String(),
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.offboardedCheckin,
        language: "en",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
        // new fields
        name: "Demo Recipient",
        createdAt: now.toIso8601String(),
      ),
    ];

    surveys.sort((a, b) => a.id.compareTo(b.id));

    return surveys;
  }

  @override
  Future<List<Survey>> fetchSurveys({required String recipientId}) async {
    return _surveys;
  }
}
