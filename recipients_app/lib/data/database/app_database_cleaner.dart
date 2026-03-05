import "package:app/data/datasource/local/payout_local_data_source.dart";
import "package:app/data/datasource/local/survey_local_data_source.dart";
import "package:app/data/datasource/local/user_local_data_source.dart";
import "package:app/data/services/update_queue_service.dart";

// This class is responsible for cleaning the app database, e.g. during logout or when the user wants to clear all data.
// It provides a single method that can be called to perform the cleaning operation, which involves deleting all records from relevant tables.
class AppDatabaseCleaner {  
  final UserLocalDataSource userLocalDataSource;
  final PayoutLocalDataSource payoutLocalDataSource;
  final SurveyLocalDataSource surveyLocalDataSource;
  final UpdateQueueService updateQueueService;

  AppDatabaseCleaner({
    required this.userLocalDataSource,
    required this.payoutLocalDataSource,
    required this.surveyLocalDataSource,
    required this.updateQueueService,
  });

  Future<void> cleanDatabase() async {  
    // Clear user data
    await userLocalDataSource.clearRecipient();

    // Clear payout data
    await payoutLocalDataSource.clearPayouts();

    // Clear survey data
    await surveyLocalDataSource.clearSurveys();

    // Clear update queue data
    await updateQueueService.clearUpdateQueue();
  }
}
