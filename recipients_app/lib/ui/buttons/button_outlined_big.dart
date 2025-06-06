import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

const double _buttonHeight = 60;

class ButtonOutlinedBig extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;
  final bool isLoading;

  const ButtonOutlinedBig({super.key, required this.onPressed, required this.label, this.isLoading = false});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: _buttonHeight,
      child: OutlinedButton(
        style: Theme.of(context).outlinedButtonTheme.style?.copyWith(
          backgroundColor: WidgetStateProperty.all(Colors.white),
          side: WidgetStateProperty.all(const BorderSide(color: AppColors.primaryColor, width: 2)),
        ),
        onPressed: isLoading ? null : onPressed,
        child: Text(label, style: AppStyles.buttonLabelBig.copyWith(color: AppColors.primaryColor)),
      ),
    );
  }
}
