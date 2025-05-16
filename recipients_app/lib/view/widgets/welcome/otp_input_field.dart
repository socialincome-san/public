import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class OtpInputField extends StatelessWidget {
  final TextEditingController? controller;
  final Function(String?)? onChanged;
  final bool isFirstField;

  const OtpInputField({super.key, this.controller, this.onChanged, this.isFirstField = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: AppSpacings.a4,
        child: SizedBox(
          height: 60,
          width: 60,
          child: TextFormField(
            decoration: const InputDecoration(
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: AppColors.primaryColor),
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: AppColors.primaryColor),
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
              floatingLabelBehavior: FloatingLabelBehavior.never,
              counter: SizedBox.shrink(),
            ),
            style: AppStyles.inputText,
            controller: controller,
            onChanged: onChanged,
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            maxLength: isFirstField ? 6 : 1,
          ),
        ),
      ),
    );
  }
}
