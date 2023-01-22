import "package:app/models/alert_visibility.dart";
import "package:app/models/registration.dart";
import "package:app/services/auth_service.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:intl_phone_number_input/intl_phone_number_input.dart";
import "package:provider/provider.dart";
import "package:rounded_loading_button/rounded_loading_button.dart";

RoundedLoadingButtonController btnController = RoundedLoadingButtonController();
TextEditingController inputController = TextEditingController();
final PhoneNumber number = PhoneNumber(isoCode: "SL");

class PhoneInput extends StatelessWidget {
  final AuthService auth = AuthService();

  PhoneInput({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<Registration, AlertVisibility>(
      builder: (context, registration, alertVisibility, child) {
        bool validatePhoneNumber(String? numberToValidate) {
          if (numberToValidate == null) {
            return false;
          }

          registration
              .setPhoneNumber(numberToValidate.replaceAll("+410", "+41"));
          registration
              .setPhoneNumber(numberToValidate.replaceAll("+2320", "+232"));
          return true;
        }

        auth.codeSent = (String verificationId, int? resendToken) {
          registration.setOtp(verificationId);
          btnController.stop();
        };

        auth.verificationCompleted = null;

        if (registration.phoneNumber == null) {
          inputController.clear();
        }

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
                    textFieldController: inputController,
                    initialValue: number,
                    onInputChanged: (PhoneNumber phoneNumber) {
                      registration.setPhoneNumber(phoneNumber.phoneNumber);
                    },
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
                      labelStyle:
                          TextStyle(color: Colors.grey[300], fontSize: 16),
                      enabledBorder: const OutlineInputBorder(
                        borderSide: BorderSide(color: AppColors.primaryColor),
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
                      if (!validatePhoneNumber(registration.phoneNumber)) {
                        alertVisibility.changeAlertVisibility(
                          true,
                          "formatError",
                        );
                        btnController.stop();
                        return;
                      }
                      auth.verifyPhoneNumber(registration.phoneNumber);
                      registration.toggleCodeSent();
                    },
                    child: const Text("Continue"),
                  ),
                )
              ],
            ),
          ],
        );
      },
    );
  }
}
