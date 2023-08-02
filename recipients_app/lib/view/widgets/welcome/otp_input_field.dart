import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class OtpInputField extends StatelessWidget {
  final TextEditingController? controller;
  final Function(String?)? onChanged;

  const OtpInputField({
    super.key,
    this.controller,
    this.onChanged,
  });

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
            readOnly: false,
            controller: controller,
            onFieldSubmitted: null,
            onChanged: onChanged,
            onTap: null,
            autofocus: false,
            focusNode: null,
            validator: null,
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            maxLength: 1,
          ),
        ),
      ),
    );
  }
}
