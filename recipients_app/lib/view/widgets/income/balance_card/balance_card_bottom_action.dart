import "package:app/data/models/payment/balance_card_status.dart";
import "package:app/data/models/payment/payments_ui_state.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/payments_page.dart";
import "package:flutter/material.dart";

class BalanceCardBottomAction extends StatelessWidget {
  final PaymentsUiState paymentsUiState;

  const BalanceCardBottomAction({
    super.key,
    required this.paymentsUiState,
  });

  @override
  Widget build(BuildContext context) {
    final foregroundColor = _getForegroundColor(paymentsUiState.status);

    return Container(
      color: _getBackgroundColor(paymentsUiState.status),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                _getStatusLabel(paymentsUiState),
                style: TextStyle(color: foregroundColor),
              ),
            ),
            Row(
              children: [
                ButtonSmall(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PaymentsPage(
                          paymentsUiState: paymentsUiState,
                        ),
                      ),
                    );
                  },
                  label: _getPrimaryActionLabel(paymentsUiState),
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                if (shouldShowSecondaryActionButton(
                  paymentsUiState,
                )) ...[
                  const SizedBox(width: 8),
                  ButtonSmall(
                    onPressed: () {},
                    label: "No",
                    buttonType: ButtonSmallType.outlined,
                    color: foregroundColor,
                    fontColor: foregroundColor,
                  ),
                ],
              ],
            )
          ],
        ),
      ),
    );
  }

  bool shouldShowSecondaryActionButton(
    PaymentsUiState paymentsUiState,
  ) {
    return (paymentsUiState.status == BalanceCardStatus.recentToConfirm ||
            paymentsUiState.status == BalanceCardStatus.needsAttention) &&
        paymentsUiState.unconfirmedPaymentsCount == 1;
  }

  Color _getBackgroundColor(BalanceCardStatus status) {
    switch (status) {
      case BalanceCardStatus.allConfirmed:
        return Colors.white;
      case BalanceCardStatus.recentToConfirm:
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
      case BalanceCardStatus.recentToConfirm:
        return Colors.white;
      case BalanceCardStatus.needsAttention:
        return AppColors.fontColorDark;
      case BalanceCardStatus.onHold:
        return AppColors.fontColorDark;
    }
  }

  String _getStatusLabel(PaymentsUiState paymentsUiState) {
    switch (paymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "${paymentsUiState.paymentsCount} payments received";
      case BalanceCardStatus.recentToConfirm:
        return "1 payment to review";
      case BalanceCardStatus.needsAttention:
        return "You have ${paymentsUiState.unconfirmedPaymentsCount} payments to review";
      case BalanceCardStatus.onHold:
        return "You have 2 payments to review in a row";
    }
  }

  String _getPrimaryActionLabel(PaymentsUiState paymentsUiState) {
    switch (paymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "Payments overview";
      case BalanceCardStatus.recentToConfirm:
      case BalanceCardStatus.needsAttention:
        if (paymentsUiState.unconfirmedPaymentsCount == 1) {
          return "Yes";
        } else {
          return "Review";
        }
      case BalanceCardStatus.onHold:
        return "Review";
    }
  }
}
