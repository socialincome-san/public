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
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        TextFormField(
          decoration: InputDecoration(
            hintStyle: AppStyles.inputHint,
            // hintText: hintText,
            labelText: hintText,
            suffixIcon: suffixIcon,
            floatingLabelBehavior: FloatingLabelBehavior.never,
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
        ),
        if (hintText != null)
          Positioned(
            top: 4,
            left: 12,
            child: Text(
              hintText!,
              style: AppStyles.inputHint.copyWith(
                color: AppColors.darkGrey.withOpacity(0.6),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
      ],
    );
  }
}
