import "package:app/data/models/models.dart";
import "package:app/data/models/survey/survey_card_status.dart";
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

  void getSurveys() async {
    final surveys =
        await surveyRepository.fetchSurveys(recipientId: recipient.userId);
    final mappedSurveys = surveys
        .where((element) => _shouldShowSurveyCard(element))
        .map(
          (survey) => MappedSurvey(
            survey: survey,
            surveyUrl: getSurveyUrl(
              survey,
              recipient.userId,
            ),
            cardStatus: _getSurveyCardStatus(survey),
          ),
        )
        .toList();

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

  bool _shouldShowSurveyCard(Survey survey) {
    var dateDifferenceInDays = _getSurveyDueDateAndNowDifferenceInDays(survey);
    if (dateDifferenceInDays == null) {
      return false;
    }

    var shouldShowSurveyCard =
        dateDifferenceInDays > -10 && dateDifferenceInDays < 25;
    return shouldShowSurveyCard;
  }

  SurveyCardStatus _getSurveyCardStatus(Survey survey) {
    if (survey.status != SurveyServerStatus.completed &&
        survey.status != SurveyServerStatus.missed) {
      var dateDifferenceInDays =
          _getSurveyDueDateAndNowDifferenceInDays(survey);
      if (dateDifferenceInDays == null) {
        return SurveyCardStatus.newSurvey;
      }

      if (dateDifferenceInDays > -10 && dateDifferenceInDays < 0) {
        return SurveyCardStatus.newSurvey;
      } else if (dateDifferenceInDays >= 0 && dateDifferenceInDays < 10) {
        return SurveyCardStatus.firstReminder;
      } else if (dateDifferenceInDays >= 10 && dateDifferenceInDays < 15) {
        return SurveyCardStatus.closeToDeadline;
      } else {
        SurveyCardStatus.missed;
      }
    } else if (survey.status == SurveyServerStatus.completed) {
      return SurveyCardStatus.answered;
    } else {
      return SurveyCardStatus.missed;
    }
    return SurveyCardStatus.answered;
  }
}

int? _getSurveyDueDateAndNowDifferenceInDays(Survey survey) {
  var dueDateAt = survey.dueDateAt?.toDate();
  if (dueDateAt == null) {
    return null;
  }

  var currentDate = DateTime.now();
  var dateDifference = currentDate.difference(dueDateAt);

  return dateDifference.inDays;
}

class MappedSurvey {
  final Survey survey;
  final String surveyUrl;
  final SurveyCardStatus cardStatus;

  MappedSurvey({
    required this.survey,
    required this.surveyUrl,
    required this.cardStatus,
  });
}
