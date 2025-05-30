import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class ReviewPaymentBottomAction extends StatelessWidget {
  final String actionLabel;
  final VoidCallback onAction;

  const ReviewPaymentBottomAction({super.key, required this.actionLabel, required this.onAction});

  @override
  Widget build(BuildContext context) {
    const foregroundColor = AppColors.fontColorDark;

    return Container(
      color: AppColors.yellowColor,
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            ButtonSmall(
              onPressed: () => {onAction()},
              label: actionLabel,
              buttonType: ButtonSmallType.outlined,
              color: foregroundColor,
            ),
          ],
        ),
      ),
    );
  }
}
