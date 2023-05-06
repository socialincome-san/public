import "package:app/data/models/models.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/data/repositories/repositories.dart";
import "package:cloud_firestore/cloud_firestore.dart";

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
      surveys.add(
        Survey.fromMap(
          surveyDoc.id,
          surveyDoc.data(),
        ),
      );
    }

    surveys.sort((a, b) => a.id.compareTo(b.id));

    return surveys;
  }
}
