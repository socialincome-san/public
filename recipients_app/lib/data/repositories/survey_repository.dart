import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/model/survey/survey.dart";
import "package:app/demo_manager.dart";

class SurveyRepository {
  final SurveyDataSource remoteDataSource;
  final SurveyDataSource demoDataSource;

  final DemoManager demoManager;

  const SurveyRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.demoManager,
  });

  SurveyDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  Future<List<Survey>> fetchSurveys({
    required String recipientId,
  }) => _activeDataSource.fetchSurveys(recipientId: recipientId);
}
