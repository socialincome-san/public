import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:flutter/material.dart";
import "package:intl_phone_number_input/intl_phone_number_input.dart";
import "package:provider/provider.dart";
import "package:rounded_loading_button/rounded_loading_button.dart";

class PhoneInput extends StatefulWidget {
  const PhoneInput({super.key});

  @override
  State<PhoneInput> createState() => _PhoneInputState();
}

class _PhoneInputState extends State<PhoneInput> {
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
    final isLoading = context.watch<SignupCubit>().state.status ==
        SignupStatus.loadingPhoneNumber;

    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            const SizedBox(height: 16),
            InternationalPhoneNumberInput(
              ignoreBlank: true,
              textFieldController: phoneNumberController,
              initialValue: number,
              selectorConfig: const SelectorConfig(
                selectorType: PhoneInputSelectorType.DIALOG,
              ),
              selectorTextStyle: const TextStyle(
                color: AppColors.primaryColor,
                fontSize: 20,
              ),
              inputDecoration: const InputDecoration(
                labelText: "Orange Money Number",
                labelStyle: TextStyle(
                  color: AppColors.primaryColor,
                  fontSize: 16,
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primaryColor),
                ),
              ),
              textStyle: const TextStyle(
                color: AppColors.primaryColor,
                fontSize: 20,
              ),
              inputBorder: const OutlineInputBorder(
                borderSide: BorderSide(
                  width: 200.0,
                  color: Colors.white,
                ),
              ),
              onInputChanged: (PhoneNumber value) {
                number = value;
              },
            ),
            const SizedBox(height: 16),
            ButtonBig(
              isLoading: isLoading,
              onPressed: () {
                if (number.phoneNumber != null &&
                    number.phoneNumber!.isNotEmpty) {
                  context.read<SignupCubit>().signupWithPhoneNumber(
                        phoneNumber: number.phoneNumber!,
                      );
                }
              },
              label: "Continue",
            ),
          ],
        ),
      ],
    );
  }
}
