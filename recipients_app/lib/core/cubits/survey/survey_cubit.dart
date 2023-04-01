import "package:app/data/models/models.dart";
import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:equatable/equatable.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "survey_state.dart";

class SurveyCubit extends Cubit<SurveyState> {
  final Recipient recipient;
  final User currentFirebaseUser;
  final CrashReportingRepository crashReportingRepository;

  SurveyCubit({
    required this.recipient,
    required this.currentFirebaseUser,
    required this.crashReportingRepository,
  }) : super(const SurveyState());

  /// TODO: add logic for getting the survey
  void getSurveyUrl() {
    final creationDate = currentFirebaseUser.metadata.creationTime;
    final nextSurveyDate = recipient.nextSurvey!.toDate();

    if (DateTime.now().isBefore(nextSurveyDate)) {
      emit(const SurveyState());

      return;
    }

    if (nextSurveyDate.month == creationDate?.month) {
      emit(SurveyState(surveyUrl: recipient.imLinkInitial));
    } else {
      emit(SurveyState(surveyUrl: recipient.imLinkRegular));
    }
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
}
