import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/theme/theme.dart";
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
    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          // Children will expand to fill crossAxis
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: InternationalPhoneNumberInput(
                ignoreBlank: true,
                textFieldController: phoneNumberController,
                initialValue: number,
                selectorConfig: const SelectorConfig(
                  selectorType: PhoneInputSelectorType.DIALOG,
                ),
                selectorTextStyle: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                ),
                inputDecoration: InputDecoration(
                  labelText: "Orange Money Number",
                  hintStyle: const TextStyle(color: Colors.grey),
                  labelStyle: TextStyle(color: Colors.grey[300], fontSize: 16),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: siDarkBlue),
                  ),
                ),
                textStyle: const TextStyle(
                  color: Colors.white,
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
            ),
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: RoundedLoadingButton(
                height: MediaQuery.of(context).size.height * 0.09,
                width: MediaQuery.of(context).size.width * 0.95,
                borderRadius: 5,
                controller: btnController,
                resetAfterDuration: true,
                resetDuration: const Duration(seconds: 10),
                color: Theme.of(context).primaryColor,
                onPressed: () async {
                  if (number.phoneNumber != null &&
                      number.phoneNumber!.isNotEmpty) {
                    context.read<SignupCubit>().signupWithPhoneNumber(
                          phoneNumber: number.phoneNumber!,
                        );
                  }
                },
                child: const Text("Continue"),
              ),
            )
          ],
        ),
      ],
    );
  }
}
