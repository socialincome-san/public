import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/welcome/otp_input.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class OtpInputPage extends StatefulWidget {
  const OtpInputPage({super.key});

  @override
  State<OtpInputPage> createState() => _OtpInputPageState();
}

class _OtpInputPageState extends State<OtpInputPage> {
  @override
  Widget build(BuildContext context) {
    final signupCubit = context.watch<SignupCubit>();
    final isLoadingVerificationCode = signupCubit.state.status == SignupStatus.loadingVerificationCode;
    final phoneNumber = signupCubit.state.phoneNumber ?? "";

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
              context.l10n.verificationSent(phoneNumber),
              style: AppStyles.headlineLarge.copyWith(
                color: AppColors.primaryColor,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            OtpInput(
              onCodeReady: (verificationCode) =>
                  context.read<SignupCubit>().submit(verificationCode: verificationCode, phoneNumber: phoneNumber),
            ),
            const SizedBox(height: 24),
            if (isLoadingVerificationCode) ...[
              const Center(child: CircularProgressIndicator()),
            ] else ...[
              TextButton(
                onPressed: () => context.read<SignupCubit>().resendVerificationCode(),
                child: Text(
                  context.l10n.resendVerificationCode,
                  style: Theme.of(context).textTheme.headlineMedium!.copyWith(
                    color: AppColors.primaryColor,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
