// @dart=2.9

import 'package:app/models/alertVisibility.dart';
import 'package:app/models/registration.dart';
import 'package:app/services/authService.dart';
import 'package:app/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:provider/provider.dart';
import 'package:rounded_loading_button/rounded_loading_button.dart';

RoundedLoadingButtonController btnController = RoundedLoadingButtonController();
TextEditingController inputController = TextEditingController();
final PhoneNumber number = PhoneNumber(isoCode: "SL");

class PhoneInput extends StatelessWidget {
  final AuthService auth = AuthService.instance();

  @override
  Widget build(BuildContext context) {
    return Consumer2<Registration, AlertVisibility>(
        builder: (context, registration, alertVisibility, child) {
      bool validatePhoneNumber(String numberToValidate) {
        if (numberToValidate == null) {
          return false;
        }
        registration.setPhoneNumber(numberToValidate.replaceAll("+410", "+41"));
        registration
            .setPhoneNumber(numberToValidate.replaceAll("+2320", "+232"));
        return true;
      }

      auth.codeSent = (String verificationId, int resendToken) {
        registration.setOtp(verificationId);
        btnController.stop();
      };

      auth.verificationCompleted = null;

      return Stack(children: [
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
                  selectorConfig: SelectorConfig(
                      selectorType: PhoneInputSelectorType.DIALOG),
                  selectorTextStyle: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                  ),
                  inputDecoration: InputDecoration(
                    labelText: "Orange Money Number",
                    hintStyle: TextStyle(color: Colors.grey),
                    labelStyle:
                        TextStyle(color: Colors.grey[300], fontSize: 16),
                    enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(width: 1.0, color: siDarkBlue)),
                  ),
                  textStyle: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                  ),
                  inputBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        style: BorderStyle.solid,
                        width: 200.0,
                        color: Colors.white),
                  ),
                  autoValidateMode: AutovalidateMode
                      .disabled, // Do not auto show error message
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
                            true, "formatError");
                        btnController.stop();
                        return;
                      }
                      auth.verifyPhoneNumber(registration.phoneNumber);
                      registration.toggleCodeSent();
                    },
                    child: Text('Continue')),
              )
            ]),
      ]);
    });
  }
}
