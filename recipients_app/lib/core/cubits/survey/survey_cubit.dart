import "package:app/data/models/models.dart";
import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:app/data/repositories/survey_repository.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:collection/collection.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "survey_state.dart";

const _kNewSurveyDay = -10;
const _kNormalSurveyStartDay = 0;
const _kNormalSurveyEndDay = 10;
const _kOverdueEndDay = 15;
const _kOverduePeriodDays = 6;
const _kEndOfDisplaySurveyDay = 20;

const _kSurveyBaseUrlKey = "SURVEY_BASE_URL";

class SurveyCubit extends Cubit<SurveyState> {
  final Recipient recipient;
  final SurveyRepository surveyRepository;
  final CrashReportingRepository crashReportingRepository;

  SurveyCubit({required this.recipient, required this.surveyRepository, required this.crashReportingRepository})
    : super(const SurveyState());

  Future<void> getSurveys() async {
    try {
      final mappedSurveys = await _getSurveys();

      final dashboardSurveys = mappedSurveys.where((element) => _shouldShowSurveyCard(element.survey)).toList();

      emit(
        SurveyState(
          status: SurveyStatus.updatedSuccess,
          mappedSurveys: mappedSurveys,
          dashboardMappedSurveys: dashboardSurveys,
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(const SurveyState(status: SurveyStatus.updatedFailure));
    }
  }

  Future<List<MappedSurvey>> _getSurveys() async {
    final surveys = await surveyRepository.fetchSurveys(recipientId: recipient.userId);

    final mappedSurveys =
        surveys
            .map(
              (survey) => MappedSurvey(
                name: _getReadableName(survey.id),
                survey: survey,
                surveyUrl: _getSurveyUrl(survey, recipient.userId),
                cardStatus: _getSurveyCardStatus(survey),
                daysToOverdue: _getDaysToOverdue(survey),
                daysAfterOverdue: _getDaysAfterOverdue(survey),
              ),
            )
            .sortedBy((element) => element.survey.dueDateAt ?? Timestamp.now())
            .toList();

    return mappedSurveys;
  }

  String _getSurveyUrl(Survey survey, String recipientId) {
    final params = {"email": survey.accessEmail, "pw": survey.accessPassword};

    final uri = Uri.https(const String.fromEnvironment(_kSurveyBaseUrlKey), "survey/$recipientId/${survey.id}", params);
    return uri.toString();
  }

  bool _shouldShowSurveyCard(Survey survey) {
    final dateDifferenceInDays = _getSurveyDueDateAndNowDifferenceInDays(survey);
    if (dateDifferenceInDays == null) {
      return false;
    }

    final shouldShowSurveyCard =
        dateDifferenceInDays > _kNewSurveyDay && dateDifferenceInDays < _kEndOfDisplaySurveyDay;
    return shouldShowSurveyCard;
  }

  SurveyCardStatus _getSurveyCardStatus(Survey survey) {
    if (survey.status != SurveyServerStatus.completed && survey.status != SurveyServerStatus.missed) {
      final dateDifferenceInDays = _getSurveyDueDateAndNowDifferenceInDays(survey);
      if (dateDifferenceInDays == null) {
        return SurveyCardStatus.newSurvey;
      }

      if (dateDifferenceInDays >= _kNewSurveyDay && dateDifferenceInDays < _kNormalSurveyStartDay) {
        return SurveyCardStatus.newSurvey;
      } else if (dateDifferenceInDays >= _kNormalSurveyStartDay && dateDifferenceInDays < _kNormalSurveyEndDay) {
        return SurveyCardStatus.firstReminder;
      } else if (dateDifferenceInDays >= _kNormalSurveyEndDay && dateDifferenceInDays < _kOverdueEndDay) {
        return SurveyCardStatus.overdue;
      } else {
        if ((_getDaysAfterOverdue(survey) ?? 0) > 0) {
          return SurveyCardStatus.missed;
        } else {
          return SurveyCardStatus.upcoming;
        }
      }
    } else if (survey.status == SurveyServerStatus.completed) {
      return SurveyCardStatus.answered;
    } else {
      return SurveyCardStatus.missed;
    }
  }
}

String _getReadableName(String surveyId) {
  return surveyId
      .split("-")
      .map((element) => "${element[0].toUpperCase()}${element.substring(1).toLowerCase()}")
      .join(" ");
}

int? _getDaysToOverdue(Survey survey) {
  final dueDateDaysDifference = _getSurveyDueDateAndNowDifferenceInDays(survey);
  if (dueDateDaysDifference == null) {
    return null;
  }

  return -dueDateDaysDifference + _kNormalSurveyEndDay;
}

int? _getDaysAfterOverdue(Survey survey) {
  final dueDateDaysDifference = _getSurveyDueDateAndNowDifferenceInDays(survey);
  if (dueDateDaysDifference == null) {
    return null;
  }

  return _kOverduePeriodDays - (-dueDateDaysDifference + _kOverdueEndDay);
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
