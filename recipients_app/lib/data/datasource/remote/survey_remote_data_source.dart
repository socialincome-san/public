import "package:app/data/datasource/remote/user_remote_data_source.dart";
import "package:app/data/datasource/survey_data_source.dart";
import "package:app/data/models/survey/survey.dart";
import "package:cloud_firestore/cloud_firestore.dart";

const String surveyCollection = "surveys";

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
      final survey = Survey.fromJson(surveyDoc.data());

      surveys.add(
        survey.copyWith(id: surveyDoc.id),
      );
    }

    surveys.sort((a, b) => a.id.compareTo(b.id));

    return surveys;
  }
}
