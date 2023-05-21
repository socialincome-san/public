import "package:app/data/models/models.dart";
import "package:app/data/models/survey/survey_card_status.dart";
import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:app/data/repositories/survey_repository.dart";
import "package:equatable/equatable.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "survey_state.dart";

const _kNewSurveyDay = -10;
const _kNormalSurveyStartDay = 0;
const _kNormalSurveyEndDay = 10;
const _kCloseToDeadlineSurveyEndDay = 15;
const _kEndOfDisplaySurveyDay = 20;

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
            surveyUrl: _getSurveyUrl(
              survey,
              recipient.userId,
            ),
            cardStatus: _getSurveyCardStatus(survey),
            daysToDeadline: _getDaysToDeadline(survey),
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

  String _getSurveyUrl(Survey survey, String recipientId) {
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

    var shouldShowSurveyCard = dateDifferenceInDays > _kNewSurveyDay &&
        dateDifferenceInDays < _kEndOfDisplaySurveyDay;
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

      if (dateDifferenceInDays > _kNewSurveyDay &&
          dateDifferenceInDays < _kNormalSurveyStartDay) {
        return SurveyCardStatus.newSurvey;
      } else if (dateDifferenceInDays >= _kNormalSurveyStartDay &&
          dateDifferenceInDays < _kNormalSurveyEndDay) {
        return SurveyCardStatus.firstReminder;
      } else if (dateDifferenceInDays >= _kNormalSurveyEndDay &&
          dateDifferenceInDays < _kCloseToDeadlineSurveyEndDay) {
        return SurveyCardStatus.closeToDeadline;
      } else {
        return SurveyCardStatus.missed;
      }
    } else if (survey.status == SurveyServerStatus.completed) {
      return SurveyCardStatus.answered;
    } else {
      return SurveyCardStatus.missed;
    }
  }
}

int? _getDaysToDeadline(Survey survey) {
  final dueDateDaysDifference = _getSurveyDueDateAndNowDifferenceInDays(survey);
  if (dueDateDaysDifference == null) {
    return null;
  }

  return -dueDateDaysDifference + _kCloseToDeadlineSurveyEndDay;
}

int? _getSurveyDueDateAndNowDifferenceInDays(Survey survey) {
  final dueDateAt = survey.dueDateAt?.toDate();
  if (dueDateAt == null) {
    return null;
  }

  final currentDate = DateTime.now();
  final dateDifference = currentDate.difference(dueDateAt);

  return dateDifference.inDays;
}

class MappedSurvey extends Equatable {
  final Survey survey;
  final String surveyUrl;
  final SurveyCardStatus cardStatus;
  final int? daysToDeadline;

  MappedSurvey({
    required this.survey,
    required this.surveyUrl,
    required this.cardStatus,
    required this.daysToDeadline,
  });

  @override
  List<Object?> get props => [survey, surveyUrl, cardStatus, daysToDeadline];
}
