import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/balance_card_status.dart";
import "package:app/data/models/payment/mapped_payment.dart";
import "package:app/data/models/payment/mapped_payment_status.dart";
import "package:app/data/models/payment/payments_ui_state.dart";
import "package:app/data/models/payment/social_income_payment.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/payment_status_icon.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class BalanceCard extends StatelessWidget {
  const BalanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    final paymentsUiState =
        context.watch<PaymentsCubit>().state.calculatedPaymentsUiState;

    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Padding(
            padding: AppSpacings.a16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              mainAxisSize: MainAxisSize.min,
              children: [
                BalanceCardHeader(
                  daysTo: paymentsUiState?.nextPayment.daysToPayment ?? 0,
                  amount: paymentsUiState?.nextPayment.amount ?? 0,
                ),
                const SizedBox(
                  height: 16,
                ),
                const Text(
                  "Progress",
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 13.0,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 8),
                BalanceCardGrid(
                  payments: paymentsUiState?.payments.reversed.toList() ?? [],
                ),
              ],
            ),
          ),
          if (paymentsUiState != null) ...[
            BalanceCardBottomAction(
              calculatedPaymentsUiState: paymentsUiState,
            ),
          ],
        ],
      ),
    );
  }
}

class BalanceCardGrid extends StatelessWidget {
  const BalanceCardGrid({
    super.key,
    required this.payments,
  });

  final List<MappedPayment> payments;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 12,
      crossAxisSpacing: 6,
      mainAxisSpacing: 6,
      children: List.generate(
        36,
        (index) {
          if (index < payments.length) {
            final payment = payments[index];
            return PaymentStatusIcon(
              status: payment.status,
            );
          }

          if (!payments.any(
                (element) => element.status == PaymentUiStatus.toBePaid,
              ) &&
              index == (payments.length)) {
            return const PaymentStatusIcon(
              status: PaymentUiStatus.toBePaid,
            );
          }

          return const PaymentStatusIcon(status: PaymentUiStatus.empty);
        },
      ),
    );
  }
}

class BalanceCardHeader extends StatelessWidget {
  final int daysTo;
  final int amount;

  const BalanceCardHeader({
    super.key,
    required this.daysTo,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Next payment",
                style: TextStyle(
                  fontSize: 13.0,
                ),
              ),
              Text(
                "$daysTo days",
                style: const TextStyle(
                  fontSize: 24.0,
                  color: AppColors.primaryColor,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Amount",
                style: TextStyle(
                  fontSize: 13.0,
                ),
              ),
              Text(
                "SLE $amount",
                style: const TextStyle(
                  fontSize: 24.0,
                  color: AppColors.primaryColor,
                ),
              ),
            ],
          ),
        )
      ],
    );
  }
}

class BalanceCardBottomAction extends StatelessWidget {
  final PaymentsUiState calculatedPaymentsUiState;

  const BalanceCardBottomAction({
    super.key,
    required this.calculatedPaymentsUiState,
  });

  @override
  Widget build(BuildContext context) {
    final foregroundColor =
        getForegroundColor(calculatedPaymentsUiState.status);

    return Container(
      color: getBackgroundColor(calculatedPaymentsUiState.status),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                getStatusLabel(calculatedPaymentsUiState),
                style: TextStyle(color: foregroundColor),
              ),
            ),
            Row(
              children: [
                ButtonSmall(
                  onPressed: () {},
                  label: getPrimaryActionLabel(calculatedPaymentsUiState),
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                if (shouldShowSecondaryActionButton(
                  calculatedPaymentsUiState,
                )) ...[
                  const SizedBox(
                    width: 8,
                  ),
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
    PaymentsUiState calculatedPaymentsUiState,
  ) {
    return (calculatedPaymentsUiState.status ==
                BalanceCardStatus.recentToConfirm ||
            calculatedPaymentsUiState.status ==
                BalanceCardStatus.needsAttention) &&
        calculatedPaymentsUiState.unconfirmedPaymentsCount == 1;
  }

  Color getBackgroundColor(BalanceCardStatus status) {
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

  Color getForegroundColor(BalanceCardStatus status) {
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

  String getStatusLabel(PaymentsUiState calculatedPaymentsUiState) {
    switch (calculatedPaymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "${calculatedPaymentsUiState.paymentsCount} payments received";
      case BalanceCardStatus.recentToConfirm:
        return "1 payment to review";
      case BalanceCardStatus.needsAttention:
        return "You have ${calculatedPaymentsUiState.unconfirmedPaymentsCount} payments to review";
      case BalanceCardStatus.onHold:
        return "You have 2 payments to review in a row";
    }
  }

  String getPrimaryActionLabel(
    PaymentsUiState calculatedPaymentsUiState,
  ) {
    switch (calculatedPaymentsUiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "Payments overview";
      case BalanceCardStatus.recentToConfirm:
      case BalanceCardStatus.needsAttention:
        if (calculatedPaymentsUiState.unconfirmedPaymentsCount == 1) {
          return "Yes";
        } else {
          return "Review";
        }
      case BalanceCardStatus.onHold:
        return "Review";
    }
  }
}

class BalanceCardUiState {
  final BalanceCardStatus status;
  final List<SocialIncomePayment> payments;
  final int paymentsCount;
  final int unconfirmedPaymentsCount;

  BalanceCardUiState({
    required this.paymentsCount,
    this.unconfirmedPaymentsCount = 0,
    required this.status,
    required this.payments,
  });
}
