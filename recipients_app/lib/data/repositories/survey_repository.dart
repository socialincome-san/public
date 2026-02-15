import "package:app/data/datasource/local/survey_local_data_source.dart";
import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/demo_manager.dart";

class SurveyRepository {
  final SurveyDataSource remoteDataSource;
  final SurveyDataSource demoDataSource;
  final SurveyLocalDataSource localDataSource;
  final DemoManager demoManager;

  const SurveyRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.localDataSource,
    required this.demoManager,
  });

  SurveyDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  /// Cache-first fetch with background refresh
  Future<List<Survey>> fetchSurveys({
    required String recipientId,
    Function(List<Survey>)? onFreshData,
  }) async {
    List<Survey> cachedSurveys = [];

    // 1. Try cache first (only in non-demo mode)
    if (!demoManager.isDemoEnabled) {
      try {
        cachedSurveys = await localDataSource.fetchSurveys(recipientId: recipientId);
      } catch (e) {
        // Cache read failed
      }
    }

    // 2. Fetch fresh data
    try {
      final freshSurveys = await _activeDataSource.fetchSurveys(recipientId: recipientId);

      // 3. Update cache (only in non-demo mode)
      if (!demoManager.isDemoEnabled) {
        await localDataSource.saveSurveys(freshSurveys);
      }

      // 4. Notify if data changed
      if (onFreshData != null && freshSurveys != cachedSurveys) {
        onFreshData(freshSurveys);
      }

      return freshSurveys;
    } catch (e) {
      // 5. Return cache on network error
      if (cachedSurveys.isNotEmpty) {
        return cachedSurveys;
      }
      rethrow;
    }
  }

  Future<void> clearCache(String recipientId) async {
    await localDataSource.clearSurveys(recipientId);
  }
}
