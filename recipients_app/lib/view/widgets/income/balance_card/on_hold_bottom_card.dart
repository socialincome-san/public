import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:flutter/material.dart";

class OnHoldBottomCard extends StatelessWidget {
  final VoidCallback reviewAction;

  const OnHoldBottomCard({super.key, required this.reviewAction});

  @override
  Widget build(BuildContext context) {
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
                    "2 unreviewed payments in a row. Suspended payments.",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.black,
                        ),
                  ),
                ),
                const SizedBox(width: 8),
                ButtonSmall(
                  onPressed: reviewAction,
                  label: "Review",
                  buttonType: ButtonSmallType.outlined,
                  color: AppColors.fontColorDark,
                  fontColor: AppColors.fontColorDark,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
