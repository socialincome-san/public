import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:flutter/material.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

class OnHoldBottomCard extends StatelessWidget {
  final VoidCallback reviewAction;

  const OnHoldBottomCard({super.key, required this.reviewAction});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return Card(
      clipBehavior: Clip.antiAlias,
      color: AppColors.redColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Padding(
            padding: AppSpacings.a16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    localizations.paymentsSuspended,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.black,
                        ),
                  ),
                ),
                const SizedBox(width: 8),
                ButtonSmall(
                  onPressed: reviewAction,
                  label: localizations.review,
                  buttonType: ButtonSmallType.outlined,
                  color: AppColors.fontColorDark,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
