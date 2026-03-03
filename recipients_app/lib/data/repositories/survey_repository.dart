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
  Future<void> fetchSurveys({
    required String recipientId,
    required Function(List<Survey>) onData,
  }) async {
    List<Survey> cachedSurveys = [];

    // 1. Try cache first
    try {
      cachedSurveys = await localDataSource.fetchSurveys(recipientId: recipientId);
      if (cachedSurveys.isNotEmpty) {
        onData(cachedSurveys);
      }
    } catch (e) {
      // Cache read failed
    }
  
    // 2. Fetch fresh data
    try {
      final freshSurveys = await _activeDataSource.fetchSurveys(recipientId: recipientId);

      // 3. Update cache
      await localDataSource.saveSurveys(freshSurveys);
      
      // 4. Notify if data changed
      if (freshSurveys != cachedSurveys) {
        onData(freshSurveys);
      }

      // 5. Handle case where both fresh and cached are empty - still notify with empty list
      if (freshSurveys.isEmpty && cachedSurveys.isEmpty) {
        onData([]);
      }
    } catch (e) {
      // Network failed and cached data are availble - just return
      if (cachedSurveys.isNotEmpty) {
         return;
      }
      rethrow;
    }
  }

  Future<void> clearCache(String recipientId) async {
    await localDataSource.clearSurveys(recipientId);
  }
}
