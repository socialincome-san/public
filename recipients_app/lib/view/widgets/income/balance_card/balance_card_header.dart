import "package:app/data/models/payment/payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

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
    final localizations = AppLocalizations.of(context)!;

    TextStyle dynamicTextStyle =
        Theme.of(context).textTheme.headlineLarge!.copyWith(
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
                localizations.nextPayment,
                style: const TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                _getNextDateText(localizations),
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
                localizations.amount,
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
