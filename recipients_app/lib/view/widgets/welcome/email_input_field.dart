import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class EmailInputField extends StatelessWidget {
  final TextEditingController? controller;
  final Function(String?)? onChanged;

  const EmailInputField({
    super.key,
    this.controller,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: "Email",
        labelStyle: Theme.of(context).textTheme.headlineMedium!.copyWith(color: AppColors.primaryColor),
        enabledBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.primaryColor),
          borderRadius: BorderRadius.all(Radius.circular(10)),
        ),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.primaryColor),
          borderRadius: BorderRadius.all(Radius.circular(10)),
        ),
        floatingLabelBehavior: FloatingLabelBehavior.never,
      ),
      style: AppStyles.inputText,
      keyboardType: TextInputType.emailAddress,
      onChanged: onChanged,
    );
  }
}
