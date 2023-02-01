import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class InputText extends StatelessWidget {
  final TextEditingController? controller;
  final Function(String?)? onSubmitted;
  final Function(String?)? onChanged;
  final FocusNode? focusNode;
  final String? hintText;

  const InputText({
    super.key,
    this.controller,
    this.onSubmitted,
    this.onChanged,
    this.focusNode,
    this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      decoration: InputDecoration(
        hintStyle: AppStyles.inputHint,
        hintText: hintText,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
          borderSide: const BorderSide(
            color: AppColors.primaryLightColor,
          ),
        ),
      ),
      controller: controller,
      onFieldSubmitted: onSubmitted,
      onChanged: onChanged,
      focusNode: focusNode,
    );
  }
}
