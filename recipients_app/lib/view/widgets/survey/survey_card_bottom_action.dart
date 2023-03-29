import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/payment_ui_status.dart";
import "package:app/data/models/survey/survey_card_status.dart";
import "package:app/data/models/survey/survey_ui_state.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/payment_status_icon_with_text.dart";
import "package:app/view/pages/impact_measurement_page.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

class SurveyCardBottomAction extends StatelessWidget {
  final SurveyUiState surveyUiState;

  const SurveyCardBottomAction({
    super.key,
    required this.surveyUiState,
  });

  @override
  Widget build(BuildContext context) {
    final foregroundColor = _getForegroundColor(surveyUiState.status);

    return Container(
      color: _getBackgroundColor(surveyUiState.status),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                _getStatusLabel(surveyUiState),
                style: TextStyle(color: foregroundColor),
              ),
            ),
            if (_shouldShowActionButton(surveyUiState)) ...[
              ButtonSmall(
                onPressed: () {
                  _navigateToSurvey(context);
                },
                label: "Start Survey",
                buttonType: ButtonSmallType.outlined,
                color: foregroundColor,
                fontColor: foregroundColor,
              ),
            ] else if (surveyUiState.status == SurveyCardStatus.answered) ...[
              const PaymentStatusIconWithText(
                status: PaymentUiStatus.confirmed,
                text: "Answered",
                isInverted: true,
              ),
            ] else if (surveyUiState.status == SurveyCardStatus.missed) ...[
              const PaymentStatusIconWithText(
                status: PaymentUiStatus.onHold,
                text: "Missed",
                isInverted: true,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _navigateToSurvey(BuildContext context) {
    final paymentsCubit = context.read<PaymentsCubit>();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BlocProvider.value(
          value: paymentsCubit,
          child: const ImpactMeasurementPage(),
        ),
      ),
    );
  }

  bool _shouldShowActionButton(
    SurveyUiState surveyUiState,
  ) {
    return surveyUiState.status != SurveyCardStatus.answered &&
        surveyUiState.status != SurveyCardStatus.missed;
  }

  Color _getBackgroundColor(SurveyCardStatus status) {
    switch (status) {
      case SurveyCardStatus.missed:
        return AppColors.redColor;
      case SurveyCardStatus.closeToDeadline:
        return AppColors.yellowColor;
      case SurveyCardStatus.answered:
      case SurveyCardStatus.stillSomeTime:
        return AppColors.primaryColor;
      case SurveyCardStatus.newSurvey:
        return Colors.white;
    }
  }

  Color _getForegroundColor(SurveyCardStatus status) {
    switch (status) {
      case SurveyCardStatus.missed:
        return AppColors.fontColorDark;
      case SurveyCardStatus.closeToDeadline:
        return AppColors.fontColorDark;
      case SurveyCardStatus.answered:
      case SurveyCardStatus.stillSomeTime:
        return Colors.white;
      case SurveyCardStatus.newSurvey:
        return AppColors.fontColorDark;
    }
  }

  String _getStatusLabel(SurveyUiState surveyUiState) {
    switch (surveyUiState.status) {
      case SurveyCardStatus.answered:
        return DateFormat("dd.MM.yyyy")
            .format(surveyUiState.answeredDate ?? DateTime.now());
      case SurveyCardStatus.closeToDeadline:
      case SurveyCardStatus.stillSomeTime:
      case SurveyCardStatus.newSurvey:
        return "You have ${surveyUiState.daysToDeadline} days to answer.";
      case SurveyCardStatus.missed:
        return "";
    }
  }
}
