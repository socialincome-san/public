import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/data/enums/balance_card_status.dart";
import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/data/models/payment/payouts_ui_state.dart";
import "package:app/l10n/arb/app_localizations.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/payments_page.dart";
import "package:app/view/widgets/income/review_payment_modal.dart";
import "package:collection/collection.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class BalanceCardBottomAction extends StatelessWidget {
  final PayoutsUiState paymentsUiState;

  const BalanceCardBottomAction({
    super.key,
    required this.paymentsUiState,
  });

  @override
  Widget build(BuildContext context) {
    final foregroundColor = _getForegroundColor(paymentsUiState.status);

    final shouldShowSecondaryActionButton = _shouldShowSecondaryActionButton(
      paymentsUiState,
    );

    return Container(
      color: _getBackgroundColor(paymentsUiState.status),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                _getStatusLabel(paymentsUiState, context.l10n),
                style: TextStyle(color: foregroundColor),
              ),
            ),
            Row(
              children: [
                ButtonSmall(
                  onPressed: () => _onPressedConfirm(
                    shouldShowSecondaryActionButton,
                    context,
                  ),
                  label: _getPrimaryActionLabel(paymentsUiState, context.l10n),
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                if (shouldShowSecondaryActionButton) ...[
                  const SizedBox(width: 8),
                  ButtonSmall(
                    onPressed: () => _onPressedNo(context),
                    label: context.l10n.no,
                    buttonType: ButtonSmallType.outlined,
                    color: foregroundColor,
                    fontColor: foregroundColor,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _onPressedConfirm(
    bool shouldShowSecondaryActionButton,
    BuildContext context,
  ) {
    if (shouldShowSecondaryActionButton) {
      final MappedPayout? mappedPayment = paymentsUiState.payouts.firstWhereOrNull(
        (element) => element.uiStatus == PayoutUiStatus.toReview || element.uiStatus == PayoutUiStatus.recentToReview,
      );
      if (mappedPayment != null) {
        context.read<PayoutsCubit>().confirmPayment(mappedPayment.payout);
      }
    } else {
      _navigateToPaymentsList(context);
    }
  }

  void _onPressedNo(BuildContext context) {
    final MappedPayout? mappedPayment = paymentsUiState.payouts.firstWhereOrNull(
      (element) => element.uiStatus == PayoutUiStatus.toReview || element.uiStatus == PayoutUiStatus.recentToReview,
    );

    if (mappedPayment != null) {
      final paymentsCubit = context.read<PayoutsCubit>();
      showDialog(
        context: context,
        builder: (context) => BlocProvider.value(
          value: paymentsCubit,
          child: ReviewPaymentModal(mappedPayment.payout),
        ),
      );
    }
  }

  void _navigateToPaymentsList(BuildContext context) {
    final paymentsCubit = context.read<PayoutsCubit>();

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BlocProvider.value(
          value: paymentsCubit,
          child: const PaymentsPage(),
        ),
      ),
    );
  }

  bool _shouldShowSecondaryActionButton(
    PayoutsUiState paymentsUiState,
  ) {
    return (paymentsUiState.status == BalanceCardStatus.recentToReview ||
            paymentsUiState.status == BalanceCardStatus.needsAttention) &&
        paymentsUiState.unconfirmedPayoutsCount == 1;
  }

  Color _getBackgroundColor(BalanceCardStatus status) {
    switch (status) {
      case BalanceCardStatus.allConfirmed:
        return Colors.white;
      case BalanceCardStatus.recentToReview:
        return AppColors.primaryColor;
      case BalanceCardStatus.needsAttention:
        return AppColors.yellowColor;
      case BalanceCardStatus.onHold:
        return AppColors.redColor;
    }
  }

  Color _getForegroundColor(BalanceCardStatus status) {
    switch (status) {
      case BalanceCardStatus.allConfirmed:
        return AppColors.fontColorDark;
      case BalanceCardStatus.recentToReview:
        return Colors.white;
      case BalanceCardStatus.needsAttention:
        return AppColors.fontColorDark;
      case BalanceCardStatus.onHold:
        return AppColors.fontColorDark;
    }
  }

  String _getStatusLabel(
    PayoutsUiState paymentsUiState,
    AppLocalizations localizations,
  ) {
    switch (paymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "${paymentsUiState.confirmedPayoutsCount} ${localizations.paymentsConfirmedCount}";
      case BalanceCardStatus.recentToReview:
        return localizations.paymentsInReview;
      case BalanceCardStatus.needsAttention:
        if (paymentsUiState.unconfirmedPayoutsCount == 1) {
          return localizations.paymentsInReviewOne;
        }
        return localizations.paymentsInReviewMany(paymentsUiState.unconfirmedPayoutsCount);
      case BalanceCardStatus.onHold:
        return localizations.paymentsInReviewTwo;
    }
  }

  String _getPrimaryActionLabel(
    PayoutsUiState paymentsUiState,
    AppLocalizations localizations,
  ) {
    switch (paymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return localizations.paymentsOverview;

      case BalanceCardStatus.recentToReview:
      case BalanceCardStatus.needsAttention:
        if (paymentsUiState.unconfirmedPayoutsCount == 1) {
          return localizations.yes;
        } else {
          return localizations.review;
        }
      case BalanceCardStatus.onHold:
        return localizations.review;
    }
  }
}
