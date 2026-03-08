import "dart:async";
import "dart:convert";
import "dart:io";

import "package:app/data/datasource/local/app_cache_database.dart";
import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/demo_manager.dart";

const _kSurveysCacheKey = "surveys";

class SurveyRepository {
  final SurveyDataSource remoteDataSource;
  final SurveyDataSource demoDataSource;
  final DemoManager demoManager;
  final AppCacheDatabase cacheDatabase;

  const SurveyRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.demoManager,
    required this.cacheDatabase,
  });

  Stream<List<Survey>> fetchSurveys({
    required String recipientId,
  }) async* {
    if (demoManager.isDemoEnabled) {
      yield await demoDataSource.fetchSurveys(recipientId: recipientId);
      return;
    }

    // Emit cached data first
    final cachedJson = await cacheDatabase.get(_kSurveysCacheKey);
    var hasUsableCache = false;
    if (cachedJson != null) {
      try {
        final list = jsonDecode(cachedJson) as List<dynamic>;
        hasUsableCache = true;
        yield list.map((e) => SurveyMapper.fromMap(e as Map<String, dynamic>)).toList();
      } on Exception {
        hasUsableCache = false;
        // Ignore cache deserialization errors
      }
    }

    // Then fetch from network
    try {
      final surveys = await remoteDataSource.fetchSurveys(recipientId: recipientId);
      final json = jsonEncode(surveys.map((e) => e.toMap()).toList());
      await cacheDatabase.put(_kSurveysCacheKey, json);
      yield surveys;
    } on SocketException {
      if (!hasUsableCache) rethrow;
    } on TimeoutException {
      if (!hasUsableCache) rethrow;
    } on HttpException {
      if (!hasUsableCache) rethrow;
    }
  }
}
