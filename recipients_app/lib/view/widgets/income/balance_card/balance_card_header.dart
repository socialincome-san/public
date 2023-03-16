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
              const SizedBox(height: 4),
              Text(
                "$daysTo days",
                style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                      color: AppColors.primaryColor,
                      fontWeight: FontWeight.bold,
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
              const SizedBox(height: 4),
              Text(
                "SLE $amount",
                style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                      color: AppColors.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        )
      ],
    );
  }
}
