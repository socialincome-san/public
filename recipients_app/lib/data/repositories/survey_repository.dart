import "package:app/data/models/models.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/data/repositories/repositories.dart";
import "package:cloud_firestore/cloud_firestore.dart";

const String surveyCollection = "surveys";

class SurveyRepository {
  final FirebaseFirestore firestore;

  const SurveyRepository({
    required this.firestore,
  });

  Future<List<Survey>> fetchSurveys({
    required String recipientId,
  }) async {
    final List<Survey> surveys = <Survey>[];

    final surveysDocs = await firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(surveyCollection)
        .get();

    for (final surveyDoc in surveysDocs.docs) {
      final survey = Survey.fromJson(surveyDoc.data());

      surveys.add(
        survey.copyWith(id: surveyDoc.id)
      );
    }

    surveys.sort((a, b) => a.id.compareTo(b.id));

    return surveys;
  }
}
