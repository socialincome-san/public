import "package:app/data/models/models.dart";
import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:app/data/repositories/survey_repository.dart";
import "package:equatable/equatable.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "survey_state.dart";

class SurveyCubit extends Cubit<SurveyState> {
  final Recipient recipient;
  final SurveyRepository surveyRepository;
  final CrashReportingRepository crashReportingRepository;

  SurveyCubit({
    required this.recipient,
    required this.surveyRepository,
    required this.crashReportingRepository,
  }) : super(const SurveyState());

  /// TODO: add logic for getting the survey
  void getSurveys() async {
    final surveys =
        await surveyRepository.fetchSurveys(recipientId: recipient.userId);
    final mappedSurveys = surveys
        .map(
          (survey) => MappedSurvey(
            survey: survey,
            surveyUrl: getSurveyUrl(
              survey,
              recipient.userId,
            ),
          ),
        )
        .toList();
    final nextSurveyDate = recipient.nextSurvey!.toDate();

    if (DateTime.now().isBefore(nextSurveyDate)) {
      emit(SurveyState(mappedSurveys: mappedSurveys));

      return;
    }

    emit(SurveyState(mappedSurveys: mappedSurveys));
  }

  void setNextSurvey() {
    DateTime previousDate;

    final DateTime? currentNextSurvey = recipient.nextSurvey?.toDate();

    if (currentNextSurvey == null) {
      previousDate = FirebaseAuth.instance.currentUser?.metadata.creationTime ??
          DateTime.now();
    } else {
      previousDate = currentNextSurvey;
    }

    DateTime resultNextSurvey;
    if (previousDate.month > 6) {
      resultNextSurvey =
          DateTime(previousDate.year + 1, previousDate.month - 6);
    } else {
      resultNextSurvey = DateTime(previousDate.year, previousDate.month + 6);
    }

    try {
      // TODO update
      // nextSurvey = resultNextSurvey;
      // databaseService.updateNextSurvey(resultNextSurvey);

      emit(
        SurveyState(
          status: SurveyStatus.updatedSuccess,
          nextSurveyDate: resultNextSurvey,
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(const SurveyState(status: SurveyStatus.updatedFailure));
    }
  }

  String getSurveyUrl(Survey survey, String recipientId) {
    final params = {
      "email": survey.accessEmail,
      "pw": survey.accessPassword!,
    };

    // TODO: confirm url, what about stage / local?
    final uri = Uri.https(
      "public-dusky-eight.vercel.app",
      "survey/$recipientId/${survey.id}",
      params,
    );
    return uri.toString();
  }
}

class MappedSurvey {
  final Survey survey;
  final String surveyUrl;

  MappedSurvey({required this.survey, required this.surveyUrl});
}
