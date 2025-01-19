import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/demo_manager.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
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
  late PhoneNumber number;

  @override
  void initState() {
    super.initState();
    btnController = RoundedLoadingButtonController();
    phoneNumberController = TextEditingController();
    number = PhoneNumber(isoCode: "SL");
  }

  @override
  void dispose() {
    phoneNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final demoManager = RepositoryProvider.of<DemoManager>(context);
    final isLoading = context.watch<SignupCubit>().state.status == SignupStatus.loadingPhoneNumber;

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Align(
              alignment: Alignment.topRight,
              child: SafeArea(
                child: ButtonSmall(
                  onPressed: () {
                    demoManager.isDemoEnabled = true;
                  },
                  label: localizations.demoCta,
                  buttonType: ButtonSmallType.outlined,
                ),
              ),
            ),
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
                            labelStyle:
                                Theme.of(context).textTheme.headlineMedium!.copyWith(color: AppColors.primaryColor),
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
          ],
        ),
      ),
    );
  }
}
