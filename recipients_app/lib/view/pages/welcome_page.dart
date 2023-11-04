
import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/view/error_localization_helper.dart";
import "package:app/view/widgets/welcome/otp_input_page.dart";
import "package:app/view/widgets/welcome/phone_input_page.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

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
    final localizations = AppLocalizations.of(context)!;

    return Scaffold(
      body: BlocConsumer<SignupCubit, SignupState>(
        listener: (context, state) {
          if (state.status == SignupStatus.verificationFailure) {
            FlushbarHelper.showFlushbar(
              context,
              message: localizeExceptionMessage(state.exception, localizations),
              type: FlushbarType.error,
            );
          } else if (state.status == SignupStatus.phoneNumberFailure) {
            FlushbarHelper.showFlushbar(
              context,
              message: localizeExceptionMessage(state.exception, localizations),
              type: FlushbarType.error,
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
