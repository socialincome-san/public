import "package:app/data/datasource/demo/survey_demo_data_source.dart";
import "package:app/data/datasource/remote/survey_remote_data_source.dart";
import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/models.dart";
import "package:app/data/models/survey/survey.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class SurveyRepository {
  late SurveyDataSource remoteDataSource = SurveyRemoteDataSource(firestore: firestore);
  late SurveyDataSource demoDataSource = SurveyDemoDataSource(); // Assuming you have a demo source

  final bool useRemoteDataSource;
  final FirebaseFirestore firestore;

  SurveyRepository({
    required this.firestore,
    this.useRemoteDataSource = false,
  });

  SurveyDataSource get _activeDataSource => useRemoteDataSource ? remoteDataSource : demoDataSource;

  Future<List<Survey>> fetchSurveys({
    required String recipientId,
  }) async {
    return _activeDataSource.fetchSurveys(recipientId: recipientId);
  }
}
