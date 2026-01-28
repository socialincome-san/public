import "dart:convert";

import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/data/services/authenticated_client.dart";

class SurveyRemoteDataSource implements SurveyDataSource {
  final Uri baseUri;
  final AuthenticatedClient authenticatedClient;

  const SurveyRemoteDataSource({
    required this.baseUri,
    required this.authenticatedClient,
  });

  @override
  Future<List<Survey>> fetchSurveys({required String recipientId}) async {
    final uri = baseUri.resolve("api/v1/recipients/me/surveys");
    final response = await authenticatedClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch surveys: ${response.statusCode}");
    }

    final responseBody = jsonDecode(response.body) as List<dynamic>;
    final surveys = responseBody.map((e) => SurveyMapper.fromMap(e as Map<String, dynamic>)).toList();
    return surveys;
  }
}
