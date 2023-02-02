import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class ButtonBig extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;

  const ButtonBig({
    super.key,
    required this.onPressed,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(
        label,
        style: AppStyles.buttonLabelBig,
      ),
    );
  }
}
