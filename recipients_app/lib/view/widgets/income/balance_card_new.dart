import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/models/social_income_payment.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/calculated_payment_status.dart";
import "package:app/view/widgets/income/payment_status_icon.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class NewBalanceCard extends StatelessWidget {
  const NewBalanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    final currentRecipient = context.watch<AuthCubit>().state.recipient;

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
                const BalanceCardHeader(
                  daysTo: 20,
                  amount: 400,
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
                BalanceCardGrid(currentRecipient: currentRecipient),
              ],
            ),
          ),
          BalanceCardBottomAction(
            uiState: BalanceCardUiState(
              status: BalanceCardStatus.allConfirmed,
              paymentsCount: paymentCollection.length,
            ),
          ),
          BalanceCardBottomAction(
            uiState: BalanceCardUiState(
              status: BalanceCardStatus.recentToConfirm,
              paymentsCount: paymentCollection.length,
              unconfirmedPaymentsCount: 1,
            ),
          ),
          BalanceCardBottomAction(
            uiState: BalanceCardUiState(
              status: BalanceCardStatus.needsAttention,
              paymentsCount: paymentCollection.length,
              unconfirmedPaymentsCount: 1,
            ),
          ),
          BalanceCardBottomAction(
            uiState: BalanceCardUiState(
              status: BalanceCardStatus.onHold,
              paymentsCount: paymentCollection.length,
            ),
          ),
        ],
      ),
    );
  }
}

class BalanceCardGrid extends StatelessWidget {
  const BalanceCardGrid({
    super.key,
    required this.currentRecipient,
  });

  final Recipient? currentRecipient;

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
          if (index < (currentRecipient?.payments?.length ?? 0)) {
            final transaction = currentRecipient?.payments?[index];
            if (transaction?.status == PaymentStatus.confirmed) {
              return const PaymentStatusIcon(
                status: CalculatedPaymentStatus.confirmed,
              );
            }
            if (transaction?.status == PaymentStatus.contested) {
              return const PaymentStatusIcon(
                status: CalculatedPaymentStatus.contested,
              );
            }
            if (transaction?.status == PaymentStatus.paid) {
              return const PaymentStatusIcon(
                status: CalculatedPaymentStatus.toReview,
              );
            }
          }
          if (index == (currentRecipient?.payments?.length ?? 0)) {
            return const PaymentStatusIcon(
              status: CalculatedPaymentStatus.toBePaid,
            );
          }
          if (index == (currentRecipient?.payments?.length ?? 0) + 1) {
            return const PaymentStatusIcon(
                status: CalculatedPaymentStatus.onHold,);
          }

          return const PaymentStatusIcon(status: CalculatedPaymentStatus.empty);
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
  final BalanceCardUiState uiState;

  const BalanceCardBottomAction({super.key, required this.uiState});

  @override
  Widget build(BuildContext context) {
    final foregroundColor = getForegroundColor(uiState.status);

    return Container(
      color: getBackgroundColor(uiState.status),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                getStatusLabel(uiState),
                style: TextStyle(color: foregroundColor),
              ),
            ),
            Row(
              children: [
                ButtonSmall(
                  onPressed: () {},
                  label: getPrimaryActionLabel(uiState),
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                if (shouldShowSecondaryActionButton(uiState)) ...[
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

  bool shouldShowSecondaryActionButton(BalanceCardUiState uiState) {
    return (uiState.status == BalanceCardStatus.recentToConfirm ||
            uiState.status == BalanceCardStatus.needsAttention) &&
        uiState.unconfirmedPaymentsCount == 1;
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

  String getStatusLabel(BalanceCardUiState uiState) {
    switch (uiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "${uiState.paymentsCount} payments received";
      case BalanceCardStatus.recentToConfirm:
        return "1 payment to review";
      case BalanceCardStatus.needsAttention:
        return "You have ${uiState.unconfirmedPaymentsCount} payments to review";
      case BalanceCardStatus.onHold:
        return "You have 2 payments to review in a row";
    }
  }

  String getPrimaryActionLabel(BalanceCardUiState uiState) {
    switch (uiState.status) {
      case BalanceCardStatus.allConfirmed:
        return "Payments overview";
      case BalanceCardStatus.recentToConfirm:
      case BalanceCardStatus.needsAttention:
        if (uiState.unconfirmedPaymentsCount == 1) {
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
  final int paymentsCount;
  final int unconfirmedPaymentsCount;

  BalanceCardUiState({
    required this.paymentsCount,
    this.unconfirmedPaymentsCount = 0,
    required this.status,
  });
}

enum BalanceCardStatus {
  allConfirmed,
  recentToConfirm,
  needsAttention,
  onHold,
}
