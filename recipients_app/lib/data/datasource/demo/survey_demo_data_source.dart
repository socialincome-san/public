import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/models.dart";
import "package:app/data/models/recipient_main_language.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/data/models/survey/survey_questionnaire.dart";
import "package:app/data/models/survey/survey_status.dart";

class SurveyDemoDataSource implements SurveyDataSource {
  final List<Survey> _surveys = _generateDemoSurveys();

  static List<Survey> _generateDemoSurveys() {
    final now = DateTime.now();
    final surveys = [
      Survey(
        id: "onboarding",
        status: SurveyStatus.scheduled,
        dueDateAt: now.subtract(const Duration(days: 10)),
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.onboarding,
        recipientName: "Demo Recipient",
        language: RecipientMainLanguage.en,
        sentAt: now,
        completedAt: now,
        comments: "Demo comments",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
      ),
      Survey(
        id: "checkin",
        status: SurveyStatus.scheduled,
        dueDateAt: now,
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.checkin,
        recipientName: "Demo Recipient",
        language: RecipientMainLanguage.en,
        sentAt: now,
        completedAt: now,
        comments: "Demo comments",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
      ),
      Survey(
        id: "offboarding",
        status: SurveyStatus.scheduled,
        dueDateAt: now.add(const Duration(days: 11)),
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.offboarding,
        recipientName: "Demo Recipient",
        language: RecipientMainLanguage.en,
        sentAt: now,
        completedAt: now,
        comments: "Demo comments",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
      ),
      Survey(
        id: "followup",
        status: SurveyStatus.scheduled,
        dueDateAt: DateTime.now().add(const Duration(days: 16)),
        recipientId: "demo",
        questionnaire: SurveyQuestionnaire.offboardedCheckin,
        recipientName: "Demo Recipient",
        language: RecipientMainLanguage.en,
        sentAt: now,
        completedAt: now,
        comments: "Demo comments",
        data: "Demo data",
        accessEmail: "demo@socialincome.com",
        accessPw: "demo",
        accessToken: "demo",
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
