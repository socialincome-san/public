import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:flutter/material.dart";
import "package:provider/provider.dart";
import "package:rounded_loading_button/rounded_loading_button.dart";

class OtpInput extends StatefulWidget {
  const OtpInput({super.key});

  @override
  State<OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<OtpInput> {
  late final RoundedLoadingButtonController btnController;
  late final TextEditingController inputController;

  @override
  void initState() {
    super.initState();
    inputController = TextEditingController();
    btnController = RoundedLoadingButtonController();
  }

  @override
  void dispose() {
    inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        TextFormField(
          controller: inputController,
          style: const TextStyle(color: Colors.white),
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: "Verification code",
            labelStyle: TextStyle(color: Colors.white),
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.white),
            ),
          ),
        ),
        Row(
          children: [
            TextButton(
              onPressed: () async =>
                  context.read<SignupCubit>().resendVerificationCode(),
              child: const Text(
                "Resend code",
                style: TextStyle(
                  color: Colors.white,
                  decoration: TextDecoration.underline,
                ),
              ),
            )
          ],
        ),
        RoundedLoadingButton(
          height: MediaQuery.of(context).size.height * 0.09,
          width: MediaQuery.of(context).size.width * 1,
          borderRadius: 5,
          resetAfterDuration: true,
          resetDuration: const Duration(seconds: 10),
          controller: btnController,
          color: Theme.of(context).primaryColor,
          onPressed: () {
            // TODO: catch errors if:
            // - no code was entered
            context
                .read<SignupCubit>()
                .submitVerificationCode(inputController.text);
          },
          child: const Text("Login"),
        )
      ],
    );
  }
}
