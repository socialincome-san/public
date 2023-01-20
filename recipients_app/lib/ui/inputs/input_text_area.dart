import "package:app/ui/configs/app_styles.dart";
import "package:flutter/material.dart";

class InputTextArea extends StatelessWidget {
  final TextEditingController? controller;
  final Function(String?)? onSubmitted;
  final Function(String?)? onChanged;
  final FocusNode? focusNode;
  final int minLines;
  final int maxLines;
  final String? hintText;

  const InputTextArea({
    super.key,
    this.controller,
    this.onSubmitted,
    this.onChanged,
    this.focusNode,
    this.minLines = 3,
    this.maxLines = 5,
    this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      minLines: minLines,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: AppStyles.inputHint,
      ),
      keyboardType: TextInputType.multiline,
      controller: controller,
      onFieldSubmitted: onSubmitted,
      onChanged: onChanged,
      focusNode: focusNode,
    );
  }
}
