import "dart:developer";

import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/data/services/auth_service.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/error_localization_helper.dart";
import "package:app/view/widgets/welcome/otp_input_page.dart";
import "package:app/view/widgets/welcome/phone_input_page.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:url_launcher/url_launcher.dart";

final _googleSupportLinkUri = Uri.parse("https://support.google.com/googleplay/answer/15747876");
Future<void> _openPlayStore() async {
  try {
    final ok = await launchUrl(_googleSupportLinkUri, mode: LaunchMode.externalApplication);
    if (ok) return;
  } catch (e, st) {
    log("Failed to open $_googleSupportLinkUri", error: e, stackTrace: st);
  }
}

class WelcomePage extends StatelessWidget {
  const WelcomePage();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => SignupCubit(
        authService: context.read<AuthService>(),
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
      body: 
      MultiBlocListener(
        listeners: [
          BlocListener<SignupCubit, SignupState>(
            listener: (context, state) {
              if (state.status == SignupStatus.verificationFailure || state.status == SignupStatus.phoneNumberFailure) {
                final exception = state.exception;
                final isPlayIntegrityError = exception is AuthException && exception.code == "play-integrity-unavailable";
                FlushbarHelper.showFlushbar(
                  context,
                  message: localizeExceptionMessage(exception, context.l10n),
                  type: FlushbarType.error,
                  persistent: isPlayIntegrityError,
                  mainButton: isPlayIntegrityError
                      ? TextButton(
                          onPressed: _openPlayStore,
                          child: Text(
                            context.l10n.openGoogleSupportPageUpdatePlayStore,
                            style: const TextStyle(color: AppColors.fontColorDark, fontWeight: FontWeight.bold),
                          ),
                        )
                      : null,
                );
              }
            },
          ),
          BlocListener<AuthCubit, AuthState>(
            listener: (context, authState) {
              if (authState.status == AuthStatus.authenticatedWithoutRecipient) {
                // Navigate back to phone input page
                context.read<SignupCubit>().changeToPhoneInput();
              }
            },
          ),
        ],
        child: BlocBuilder<SignupCubit, SignupState>(
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
      ),
    );
  }
}
