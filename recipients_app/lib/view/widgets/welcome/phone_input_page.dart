import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/view/widgets/welcome/email_input_field.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";
import "package:intl_phone_number_input/intl_phone_number_input.dart";
import "package:rounded_loading_button/rounded_loading_button.dart";

class PhoneInputPage extends StatefulWidget {
  const PhoneInputPage({super.key});

  @override
  State<PhoneInputPage> createState() => _PhoneInputPageState();
}

class _PhoneInputPageState extends State<PhoneInputPage> {
  late final RoundedLoadingButtonController btnController;
  late final TextEditingController phoneNumberController;
  late final TextEditingController emailFieldController;

  late PhoneNumber number;
  String? email;

  @override
  void initState() {
    super.initState();
    btnController = RoundedLoadingButtonController();
    phoneNumberController = TextEditingController();
    emailFieldController = TextEditingController();
    number = PhoneNumber(isoCode: "SL");
  }

  @override
  void dispose() {
    phoneNumberController.dispose();
    emailFieldController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    final signUpCubit = context.watch<SignupCubit>();
    final isLoading = signUpCubit.state.status == SignupStatus.loadingPhoneNumber;

    var showEmailLinkAlternative = true;
    if (signUpCubit.state.status == SignupStatus.phoneNumberFailure) {
      final ex = signUpCubit.state.exception;
      if (ex is FirebaseAuthException) {
        if (ex.code == "invalid-phone-number") {
          showEmailLinkAlternative = true;
        }
      }
    }

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image(
                    image: const AssetImage("assets/earth_animation.gif"),
                    height: MediaQuery.of(context).size.height * 0.3,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    localizations.yourMobilePhone,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 24,
                      color: AppColors.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Stack(
                    children: <Widget>[
                      Positioned(
                        bottom: 0,
                        top: 0,
                        left: 0,
                        child: Container(
                          width: 120,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.primaryColor),
                          ),
                          child: const SizedBox(),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 16.0),
                        child: InternationalPhoneNumberInput(
                          ignoreBlank: true,
                          textFieldController: phoneNumberController,
                          initialValue: number,
                          selectorConfig: const SelectorConfig(
                            selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
                            useBottomSheetSafeArea: true,
                          ),
                          selectorTextStyle: const TextStyle(
                            color: AppColors.primaryColor,
                            fontSize: 18,
                          ),
                          inputDecoration: InputDecoration(
                            labelText: localizations.phoneNumber,
                            labelStyle: Theme.of(context)
                                .textTheme
                                .headlineMedium!
                                .copyWith(color: AppColors.primaryColor),
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
                          textStyle: const TextStyle(
                            color: AppColors.primaryColor,
                            fontSize: 20,
                          ),
                          onInputChanged: (PhoneNumber value) => number = value,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ButtonBig(
                  isLoading: isLoading,
                  onPressed: () {
                    if (number.phoneNumber != null && number.phoneNumber!.isNotEmpty) {
                      context.read<SignupCubit>().signupWithPhoneNumber(
                            phoneNumber: number.phoneNumber!,
                          );
                    }
                  },
                  label: localizations.continueText,
                ),
              ],
            ),
            const SizedBox(height: 32),
            if (showEmailLinkAlternative) ...[
              EmailInputField(
                onChanged: (value) => email = value,
                controller: emailFieldController,
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  if (email != null && email!.isNotEmpty) {
                    context.read<SignupCubit>().signupWithEmailLink(email: email!);
                  }
                },
                child: const Text(
                  "Verify with email",
                  style: TextStyle(
                    color: AppColors.primaryColor,
                    fontSize: 16,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ],
        ),
      ),
    );
  }
}
