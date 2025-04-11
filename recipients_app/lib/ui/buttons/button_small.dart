import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

enum ButtonSmallType {
  outlined,
  filled,
}

class ButtonSmall extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;
  final ButtonSmallType buttonType;
  final Color color;
  final Color fontColor;

  const ButtonSmall({
    super.key,
    required this.onPressed,
    required this.label,
    required this.buttonType,
    this.color = AppColors.primaryColor,
    this.fontColor = AppColors.fontColorDark,
  });

  @override
  Widget build(BuildContext context) {
    switch (buttonType) {
      case ButtonSmallType.outlined:
        return SizedBox(
          height: 26,
          child: ElevatedButton(
            style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                  backgroundColor: WidgetStateProperty.all(Colors.transparent),
                  foregroundColor: WidgetStateProperty.all(color),
                  shape: WidgetStateProperty.all(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
                      side: BorderSide(
                        color: color,
                      ),
                    ),
                  ),
                ),
            onPressed: onPressed,
            child: Text(
              label,
              style: AppStyles.buttonLabelSmall.copyWith(
                color: fontColor,
              ),
            ),
          ),
        );
      case ButtonSmallType.filled:
        return SizedBox(
          height: 26,
          child: ElevatedButton(
            style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                  backgroundColor: WidgetStateProperty.all(color),
                  foregroundColor: WidgetStateProperty.all(Colors.white),
                  shape: WidgetStateProperty.all(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
                    ),
                  ),
                ),
            onPressed: onPressed,
            child: Text(
              label,
              style: AppStyles.buttonLabelSmall.copyWith(color: fontColor),
            ),
          ),
        );
    }
  }
}
