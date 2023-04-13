import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/inputs/input_text.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class OtpInput extends StatefulWidget {
  const OtpInput({super.key});

  @override
  State<OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<OtpInput> {
  late final TextEditingController inputController;

  @override
  void initState() {
    super.initState();
    inputController = TextEditingController();
  }

  @override
  void dispose() {
    inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<SignupCubit>().state.status ==
        SignupStatus.loadingVerificationCode;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        InputText(
          controller: inputController,
          keyboardType: TextInputType.number,
          hintText: "Verification code",
        ),
        const SizedBox(height: 16),
        ButtonBig(
          isLoading: isLoading,
          onPressed: () {
            // TODO: catch errors if:
            // - no code was entered
            context
                .read<SignupCubit>()
                .submitVerificationCode(inputController.text);
          },
          label: "Login",
        ),
        TextButton(
          onPressed: () async =>
              context.read<SignupCubit>().resendVerificationCode(),
          child: const Text(
            "Resend code",
            style: TextStyle(
              color: AppColors.primaryColor,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
        TextButton(
          onPressed: () async =>
              context.read<SignupCubit>().changeToPhoneInput(),
          child: const Text(
            "Back to phone number",
            style: TextStyle(
              color: AppColors.primaryColor,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }
}
