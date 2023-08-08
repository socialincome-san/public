import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/core/helpers/snackbar_helper.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/view/widgets/welcome/otp_input_page.dart";
import "package:app/view/widgets/welcome/phone_input_page.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class WelcomePage extends StatelessWidget {
  const WelcomePage();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => SignupCubit(
        userRepository: context.read<UserRepository>(),
        crashReportingRepository: context.read<CrashReportingRepository>(),
      ),
      child: const _WelcomeView(),
    );
  }
}

class _WelcomeView extends StatelessWidget {
  const _WelcomeView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<SignupCubit, SignupState>(
        listener: (context, state) {
          if (state.status == SignupStatus.verificationFailure) {
            SnackbarHelper.showSnackbar(
              context,
              message: state.exception.toString(),
              type: SnackbarType.error,
            );
          } else if (state.status == SignupStatus.phoneNumberFailure) {
            SnackbarHelper.showSnackbar(
              context,
              message: state.exception.toString(),
              type: SnackbarType.error,
            );
          }
        },
        builder: (context, state) {
          switch (state.status) {
            case SignupStatus.loadingPhoneNumber:
            case SignupStatus.enterPhoneNumber:
            case SignupStatus.phoneNumberFailure:
              return const PhoneInputPage();
            case SignupStatus.loadingVerificationCode:
            case SignupStatus.enterVerificationCode:
            case SignupStatus.verificationSuccess:
            case SignupStatus.verificationFailure:
              return const OtpInputPage();
          }
        },
      ),
    );
  }
}
