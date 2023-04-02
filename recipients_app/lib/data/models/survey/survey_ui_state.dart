import "package:app/data/models/survey/survey_card_status.dart";
import "package:equatable/equatable.dart";

class SurveyUiState extends Equatable {
  final SurveyCardStatus status;
  final int daysToDeadline;
  final DateTime? answeredDate;

  const SurveyUiState({
    required this.status,
    required this.daysToDeadline,
    this.answeredDate,
  });

  @override
  List<Object?> get props {
    return [
      status,
      daysToDeadline,
      answeredDate,
    ];
  }

  SurveyUiState copyWith({
    SurveyCardStatus? status,
    int? daysToDeadline,
    DateTime? answeredDate,
  }) {
    return SurveyUiState(
      status: status ?? this.status,
      daysToDeadline: daysToDeadline ?? this.daysToDeadline,
      answeredDate: answeredDate ?? this.answeredDate,
    );
  }
}
