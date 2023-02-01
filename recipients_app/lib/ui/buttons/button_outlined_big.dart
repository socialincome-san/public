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
