import "package:app/data/models/currency.dart";
import "package:app/data/models/program.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class ProgramInfo extends StatelessWidget {
  final Program program;

  const ProgramInfo({
    super.key,
    required this.program,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.l10n.programInformation,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: AppSpacings.a12,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Text("${context.l10n.name}:", style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(width: 8),
                    Text(program.name, style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
                Row(
                  children: [
                    Text("${context.l10n.country}:", style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(width: 8),
                    Text(program.country.isoCode, style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
                Row(
                  children: [
                    Text("${context.l10n.duration}:", style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(width: 8),
                    Text(
                      "${program.programDurationInMonths} ${context.l10n.months}",
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
                Row(
                  children: [
                    Text("${context.l10n.interval}:", style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(width: 8),
                    Text(
                      program.payoutInterval.name,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
                Row(
                  children: [
                    Text("${context.l10n.amount}:", style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(width: 8),
                    Text(
                      "${program.payoutPerInterval} ${program.payoutCurrency.toDisplayString()}",
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
