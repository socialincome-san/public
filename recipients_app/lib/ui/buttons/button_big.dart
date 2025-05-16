import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

const double _buttonHeight = 60;

class ButtonBig extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;
  final bool isLoading;

  const ButtonBig({super.key, required this.onPressed, required this.label, this.isLoading = false});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: _buttonHeight,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        child:
            isLoading
                ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
                : Text(label, style: AppStyles.buttonLabelBig),
      ),
    );
  }
}
