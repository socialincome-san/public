// @dart=2.9

import 'package:app/models/alertVisibility.dart';
import 'package:app/models/registration.dart';
import 'package:app/services/authService.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rounded_loading_button/rounded_loading_button.dart';

RoundedLoadingButtonController btnController = RoundedLoadingButtonController();
TextEditingController inputController = TextEditingController();

class OtpInput extends StatelessWidget {
  final AuthService auth = AuthService.instance();

  final Function login;
  OtpInput(this.login);

  @override
  Widget build(BuildContext context) {
    return Consumer2<Registration, AlertVisibility>(
        builder: (context, registration, alertVisibility, child) {
      void otpSuccess(String uid) async {
        // check if user already exists in /users
        //DatabaseService databaseService = DatabaseService(uid);
        //if (!await databaseService.userExists()) {
        //  var newUser =
        //      await databaseService.eligibleUser(registration.phoneNumber);
        //  databaseService.updateOrCreateUser(newUser);
        //}
        login();
      }

      return Column(crossAxisAlignment: CrossAxisAlignment.stretch,
          // Children will expand to fill crossAxis
          children: <Widget>[
            TextFormField(
                controller: inputController,
                style: TextStyle(color: Colors.white),
                keyboardType: TextInputType.number,
                onEditingComplete: () {
                  registration.setPhoneVerificationId(inputController.text);
                  FocusScope.of(context).requestFocus(new FocusNode());
                },
                decoration: InputDecoration(
                    labelText: "Verification code",
                    labelStyle: TextStyle(color: Colors.white),
                    enabledBorder: OutlineInputBorder(
                        borderSide:
                            BorderSide(color: Colors.white, width: 1.0)))),
            Row(mainAxisAlignment: MainAxisAlignment.start, children: [
              TextButton(
                  onPressed: () async {
                    if (registration.phoneNumber == null) return;
                    bool verified =
                        await auth.verifyPhoneNumber(registration.phoneNumber);
                    if (!verified) {
                      alertVisibility.changeAlertVisibility(true, "ineligible");
                      btnController.stop();
                    }
                  },
                  child: Text(
                    "Resend code",
                    style: TextStyle(
                        color: Colors.white,
                        decoration: TextDecoration.underline),
                  ))
            ]),
            RoundedLoadingButton(
                height: MediaQuery.of(context).size.height * 0.09,
                width: MediaQuery.of(context).size.width * 1,
                borderRadius: 5,
                resetAfterDuration: true,
                resetDuration: Duration(seconds: 10),
                controller: btnController,
                color: Theme.of(context).primaryColor,
                onPressed: () async {
                  var userId = await auth.checkOTP(
                      registration.otp, inputController.text);
                  if (userId != null) {
                    alertVisibility.changeAlertVisibility(true, "CodeCorrect");
                    otpSuccess(userId);
                    registration.setCodeSent();
                  } else {
                    btnController.stop();
                    alertVisibility.changeAlertVisibility(true, "CodeWrong");
                  }
                },
                child: Text("Login"))
          ]);
    });
  }
}
