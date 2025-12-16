import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/survey/survey.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:http/http.dart" as http;

class SurveyRemoteDataSource implements SurveyDataSource {
  final Uri baseUri;
  final http.Client httpClient;
  final FirebaseAuth firebaseAuth;

  const SurveyRemoteDataSource({
    required this.baseUri,
    required this.httpClient,
    required this.firebaseAuth,
  });

  /// curl http://localhost:3001/api/v1/recipients/me/surveys
  @override
  Future<List<Survey>> fetchSurveys({required String recipientId}) async {
    final uri = baseUri.resolve("v1/recipients/me/surveys");

    final response = await httpClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch surveys: ${response.statusCode}");
    }

    // TODO: backend currently only returns a single survey item
    // return SurveyMapper.fromJson(response.body);

    return [];
  }
}

/* const String surveyCollection = "surveys";

class SurveyRemoteDataSource implements SurveyDataSource {
  final FirebaseFirestore firestore;

  const SurveyRemoteDataSource({
    required this.firestore,
  });

  @override
  Future<List<Survey>> fetchSurveys({
    required String recipientId,
  }) async {
    final surveys = <Survey>[];

    final surveysDocs = await firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(surveyCollection)
        .get();

    for (final surveyDoc in surveysDocs.docs) {
      final survey = SurveyMapper.fromMap(surveyDoc.data());

      surveys.add(
        survey.copyWith(id: surveyDoc.id),
      );
    }

    surveys.sort((a, b) => a.id.compareTo(b.id));

    return surveys;
  }
}
 */
