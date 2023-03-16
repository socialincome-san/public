import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

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
                style: TextStyle(fontSize: 13),
              ),
              Text(
                "$daysTo days",
                style: const TextStyle(
                  fontSize: 24,
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
                style: TextStyle(fontSize: 13),
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
