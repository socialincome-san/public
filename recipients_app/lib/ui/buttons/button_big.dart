import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

enum ButtonBigType {
  outlined,
  filled,
}

class ButtonBig extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;
  final ButtonBigType buttonType;

  const ButtonBig({
    super.key,
    required this.onPressed,
    required this.label,
    required this.buttonType,
  });

  @override
  Widget build(BuildContext context) {
    switch (buttonType) {
      case ButtonBigType.outlined:
        return ElevatedButton(
          style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                backgroundColor: MaterialStateProperty.all(Colors.white),
                foregroundColor:
                    MaterialStateProperty.all(AppColors.primaryColor),
                shape: MaterialStateProperty.all(
                  RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
                    side: const BorderSide(
                      color: AppColors.primaryColor,
                    ),
                  ),
                ),
              ),
          onPressed: onPressed,
          child: Text(
            label,
            style: AppStyles.buttonLabelBig.copyWith(
              color: AppColors.primaryColor,
            ),
          ),
        );
      case ButtonBigType.filled:
        return ElevatedButton(
          onPressed: onPressed,
          child: Text(
            label,
            style: AppStyles.buttonLabelBig,
          ),
        );
    }
  }
}
