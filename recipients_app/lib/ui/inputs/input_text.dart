import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class InputText extends StatelessWidget {
  final TextEditingController? controller;
  final Function(String?)? onSubmitted;
  final Function(String?)? onChanged;
  final FocusNode? focusNode;
  final String? hintText;
  final String? Function(String?)? validator;
  final VoidCallback? onTap;
  final bool isReadOnly;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final int? maxLength;

  const InputText({
    super.key,
    this.controller,
    this.onSubmitted,
    this.onChanged,
    this.focusNode,
    this.hintText,
    this.validator,
    this.onTap,
    this.isReadOnly = false,
    this.suffixIcon,
    this.keyboardType = TextInputType.text,
    this.maxLength,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        TextFormField(
          decoration: InputDecoration(
            hintStyle: AppStyles.inputHint,
            // labelText: hintText,
            suffixIcon: suffixIcon,
            floatingLabelBehavior: FloatingLabelBehavior.never,
            // when maxLength is added TextFormField shows counter e.g. 0/1,
            // we don't need it and one of the solutions is to provide SizedBox.shrink()
            // see https://stackoverflow.com/a/58819500
            counter: const SizedBox.shrink(),
          ),
          style: AppStyles.inputText,
          readOnly: isReadOnly,
          controller: controller,
          onFieldSubmitted: onSubmitted,
          onChanged: onChanged,
          onTap: onTap,
          focusNode: focusNode,
          validator: validator,
          keyboardType: keyboardType,
          maxLength: maxLength,
        ),
        if (hintText != null)
          Positioned(
            top: 4,
            left: 12,
            child: Text(
              hintText!,
              style: AppStyles.inputHint.copyWith(
                color: AppColors.darkGrey.withValues(alpha: 0.6),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
      ],
    );
  }
}
