import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/payments_page.dart";
import "package:app/view/widgets/income/review_payment_modal.dart";
import "package:collection/collection.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class BalanceCardBottomAction extends StatelessWidget {
  final PaymentsUiState paymentsUiState;

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
                _getStatusLabel(paymentsUiState),
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
                  label: _getPrimaryActionLabel(paymentsUiState),
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                if (shouldShowSecondaryActionButton) ...[
                  const SizedBox(width: 8),
                  ButtonSmall(
                    onPressed: () => _onPressedNo(context),
                    label: "No",
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
      final MappedPayment? mappedPayment =
          paymentsUiState.payments.firstWhereOrNull(
        (element) =>
            element.uiStatus == PaymentUiStatus.toReview ||
            element.uiStatus == PaymentUiStatus.recentToReview,
      );
      if (mappedPayment != null) {
        context.read<PaymentsCubit>().confirmPayment(mappedPayment.payment);
      }
    } else {
      _navigateToPaymentsList(context);
    }
  }

  void _onPressedNo(BuildContext context) {
    final MappedPayment? mappedPayment =
        paymentsUiState.payments.firstWhereOrNull(
      (element) => (element.uiStatus == PaymentUiStatus.toReview ||
          element.uiStatus == PaymentUiStatus.recentToReview),
    );

    if (mappedPayment != null) {
      final paymentsCubit = context.read<PaymentsCubit>();
      showModalBottomSheet(
        isScrollControlled: true,
        context: context,
        builder: (context) => BlocProvider.value(
          value: paymentsCubit,
          child: ReviewPaymentModal(mappedPayment.payment),
        ),
      );
    }
  }

  void _navigateToPaymentsList(BuildContext context) {
    final paymentsCubit = context.read<PaymentsCubit>();

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
    PaymentsUiState paymentsUiState,
  ) {
    return (paymentsUiState.status == BalanceCardStatus.recentToReview ||
            paymentsUiState.status == BalanceCardStatus.needsAttention) &&
        paymentsUiState.unconfirmedPaymentsCount == 1;
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

  String _getStatusLabel(PaymentsUiState paymentsUiState) {
    switch (paymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "${paymentsUiState.confirmedPaymentsCount} payments received";
      case BalanceCardStatus.recentToReview:
        return "Did you receive the last payment?";
      case BalanceCardStatus.needsAttention:
        if (paymentsUiState.unconfirmedPaymentsCount == 1) {
          return "You have 1 payment to review. Did you receive it?";
        }
        return "You have ${paymentsUiState.unconfirmedPaymentsCount} payments to review";
      case BalanceCardStatus.onHold:
        return "You have 2 payments to review in a row";
    }
  }

  String _getPrimaryActionLabel(PaymentsUiState paymentsUiState) {
    switch (paymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "Payments overview";
      case BalanceCardStatus.recentToReview:
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
