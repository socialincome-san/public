import "package:app/data/models/survey/survey.dart";

abstract class SurveyDataSource {
  Future<List<Survey>> fetchSurveys({required String recipientId});
}
