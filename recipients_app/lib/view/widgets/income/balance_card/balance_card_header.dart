import "package:app/data/models/payment/payment.dart";
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
    TextStyle dynamicTextStyle = Theme.of(context).textTheme.headlineLarge!.copyWith(
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
              const Text(
                "Next payment",
                style: TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                _getNextDateText(),
                style: dynamicTextStyle,
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
                style: TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                "SLE $amount",
                style: dynamicTextStyle,
              ),
            ],
          ),
        )
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

  String _getNextDateText() {
    String daysText;
    if (balanceCardStatus == BalanceCardStatus.onHold) {
      daysText = "On hold";
    } else if (daysTo < 0) {
      daysText = "Next month";
    } else if (daysTo == 0) {
      daysText = "Today";
    } else if (daysTo == 1) {
      daysText = "1 day";
    } else {
      daysText = "$daysTo days";
    }

    return daysText;
  }
}
