import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/welcome/otp_input.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

class OtpInputPage extends StatefulWidget {
  const OtpInputPage({super.key});

  @override
  State<OtpInputPage> createState() => _OtpInputPageState();
}

class _OtpInputPageState extends State<OtpInputPage> {
  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final phoneNumber = context.watch<SignupCubit>().state.phoneNumber ?? "";

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text("Verification"),
        leading: BackButton(
          onPressed: () {
            context.read<SignupCubit>().changeToPhoneInput();
          },
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Text(
              localizations.verificationSent(phoneNumber),
              style: AppStyles.headlineLarge.copyWith(
                color: AppColors.primaryColor,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            OtpInput(
              onCodeReady: (verificationCode) =>
                  context.read<SignupCubit>().submitVerificationCode(verificationCode),
            ),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () async => context.read<SignupCubit>().resendVerificationCode(),
              child: Text(
                localizations.resendVerificationCode,
                style: Theme.of(context).textTheme.headlineMedium!.copyWith(
                      color: AppColors.primaryColor,
                      decoration: TextDecoration.underline,
                    ),
              ),
            ),
            const SizedBox(height: 200),
          ],
        ),
      ),
    );
  }
}
