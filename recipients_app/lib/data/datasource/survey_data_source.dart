import "package:app/data/model/survey/survey.dart";

abstract class SurveyDataSource {
  Future<List<Survey>> fetchSurveys({
    required String recipientId,
  });
}
