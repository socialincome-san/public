import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/core/helpers/snackbar_helper.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/view/widgets/welcome/otp_input.dart";
import "package:app/view/widgets/welcome/phone_input.dart";
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
      body: Stack(
        children: [
          Column(
            children: [
              Flexible(
                flex: 2,
                child: Container(color: AppColors.primaryColor),
              ),
              Flexible(
                flex: 3,
                child: Container(color: AppColors.primaryLightColor),
              ),
            ],
          ),
          Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 64, 16, 16),
                  children: [
                    const Center(
                      child: Text(
                        "Social Income",
                        style: TextStyle(color: Colors.white, fontSize: 36),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Image(
                      image: const AssetImage("assets/phone.png"),
                      height: MediaQuery.of(context).size.height * 0.4,
                    ),
                    const SizedBox(height: 32),
                    const Text(
                      "Universal Basic Income\nfrom Human to Human",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 24,
                        color: AppColors.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    BlocConsumer<SignupCubit, SignupState>(
                      listener: (context, state) {
                        if (state.status == SignupStatus.verificationFailure) {
                          SnackbarHelper.showSnackbar(
                            context,
                            message: state.exception.toString(),
                            type: SnackbarType.error,
                          );
                        } else if (state.status ==
                            SignupStatus.phoneNumberFailure) {
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
                            return const PhoneInput();
                          case SignupStatus.loadingVerificationCode:
                          case SignupStatus.enterVerificationCode:
                          case SignupStatus.verificationSuccess:
                          case SignupStatus.verificationFailure:
                            return const OtpInput();
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
