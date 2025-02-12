import "package:app/data/datasource/demo/survey_demo_data_source.dart";
import "package:app/data/datasource/remote/survey_remote_data_source.dart";
import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/models.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/demo_manager.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class SurveyRepository {
  late SurveyDataSource remoteDataSource = SurveyRemoteDataSource(firestore: firestore);
  late SurveyDataSource demoDataSource = SurveyDemoDataSource();

  final DemoManager demoManager;
  final FirebaseFirestore firestore;

  SurveyRepository({
    required this.firestore,
    required this.demoManager,
  });

  SurveyDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource  : remoteDataSource;

  Future<List<Survey>> fetchSurveys({
    required String recipientId,
  }) async {
    return _activeDataSource.fetchSurveys(recipientId: recipientId);
  }
}
