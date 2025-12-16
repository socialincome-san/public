import "package:app/data/enums/balance_card_status.dart";
import "package:app/l10n/arb/app_localizations.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class BalanceCardHeader extends StatelessWidget {
  final int daysTo;
  final int amount;
  final BalanceCardStatus balanceCardStatus;

  const BalanceCardHeader({
    super.key,
    required this.daysTo,
    required this.amount,
    required this.balanceCardStatus,
  });

  @override
  Widget build(BuildContext context) {
    final dynamicTextStyle = Theme.of(context).textTheme.headlineLarge!.copyWith(
      fontWeight: FontWeight.bold,
      color: _getTextColor(),
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.l10n.nextPayment,
                style: const TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                _getNextDateText(context.l10n),
                style: dynamicTextStyle,
              ),
            ],
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.l10n.amount,
                style: const TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                "SLE $amount",
                style: dynamicTextStyle,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _getTextColor() {
    if (balanceCardStatus == BalanceCardStatus.onHold) {
      return AppColors.redColor;
    } else {
      return AppColors.primaryColor;
    }
  }

  String _getNextDateText(AppLocalizations localizations) {
    String daysText;
    if (balanceCardStatus == BalanceCardStatus.onHold) {
      daysText = localizations.paymentsSuspended;
    } else if (daysTo < 0) {
      daysText = localizations.nextMonth;
    } else if (daysTo == 0) {
      daysText = localizations.today;
    } else if (daysTo == 1) {
      daysText = localizations.oneDay;
    } else {
      daysText = localizations.inDays(daysTo);
    }

    return daysText;
  }
}
