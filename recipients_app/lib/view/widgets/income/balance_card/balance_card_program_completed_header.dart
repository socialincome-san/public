import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class BalanceCardProgramCompletedHeader extends StatelessWidget {
  const BalanceCardProgramCompletedHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.l10n.programCompleted,
          style: Theme.of(context).textTheme.headlineLarge!.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryColor,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          context.l10n.programCompletedDescription,
          style: const TextStyle(fontSize: 13),
        ),
      ],
    );
  }
}
