import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/models.dart";
import "package:app/data/models/survey/survey.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class SurveyDemoDataSource implements SurveyDataSource {
  final List<Survey> _surveys = _generateDemoSurveys();

  static List<Survey> _generateDemoSurveys() {
    final now = DateTime.now();
    final surveys = [
      Survey(
        id: "onboarding",
        status: SurveyServerStatus.scheduled,
        dueDateAt: Timestamp.fromDate(now.subtract(const Duration(days: 10))),
      ),
      Survey(
        id: "checkin",
        status: SurveyServerStatus.scheduled,
        dueDateAt: Timestamp.fromDate(now),
      ),
      Survey(
        id: "offboarding",
        status: SurveyServerStatus.scheduled,
        dueDateAt: Timestamp.fromDate(
          now.add(const Duration(days: 11)),
        ),
      ),
      Survey(
        id: "followup",
        status: SurveyServerStatus.scheduled,
        dueDateAt: Timestamp.fromDate(
          now.add(const Duration(days: 16)),
        ),
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
