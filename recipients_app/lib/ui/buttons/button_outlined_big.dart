import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class ButtonOutlinedBig extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;

  const ButtonOutlinedBig({
    super.key,
    required this.onPressed,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      style: Theme.of(context).outlinedButtonTheme.style?.copyWith(
            backgroundColor: MaterialStateProperty.all(Colors.white),
            side: MaterialStateProperty.all(
              const BorderSide(
                color: AppColors.primaryColor,
                width: 2,
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
  }
}
