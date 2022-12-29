import "package:app/models/alert_visibility.dart";
import "package:app/models/registration.dart";
import "package:app/theme/theme.dart";
import "package:app/view/components/social_income_alert.dart";
import "package:app/view/components/social_income_contact.dart";
import "package:app/view/components/welcomePage/otp_input.dart";
import "package:app/view/components/welcomePage/phone_input.dart";
import "package:app/view/pages/main_app_page.dart";
import "package:flutter/material.dart";
import "package:provider/provider.dart";

class WelcomePage extends StatelessWidget {
  final TextStyle textbuttonStyle = const TextStyle(color: Colors.white);
  // prevents rebuilding new widget which would lose focus
  final SocialIncomeAlert ineligible = const SocialIncomeAlert(
    "Number not eligible.",
    Icons.close,
    "ineligible",
    textButton: "Contact us for support",
  );

  final SocialIncomeAlert formatError = const SocialIncomeAlert(
    "This is not a valid phone number",
    Icons.close,
    "formatError",
  );

  final SocialIncomeAlert verificationCodeError = const SocialIncomeAlert(
    "False verification code. Try again",
    Icons.close,
    "CodeWrong",
  );

  const WelcomePage({super.key});
  bool keyboardVisible() {
    return WidgetsBinding.instance.window.viewInsets.bottom == 0.0;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<Registration, AlertVisibility>(
      builder: (context, registration, alertVisibility, child) {
        void logInUI() {
          registration.clear();
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => MainAppPage()),
            (Route<dynamic> route) => false,
          );
        }

        final Widget input =
            registration.codeSent ? OtpInput(logInUI) : PhoneInput();

        return Scaffold(
          body: Stack(
            children: [
              Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Flexible(flex: 2, child: Container(color: siDarkBlue)),
                  Flexible(flex: 3, child: Container(color: siLightBlue))
                ],
              ),
              Center(
                child: Container(
                  padding: EdgeInsets.only(
                    top: MediaQuery.of(context).size.height / 15,
                  ),
                  width: MediaQuery.of(context).size.width * 0.95,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      if (alertVisibility.displayIneligibleUser)
                        ineligible
                      else if (alertVisibility.displayFormatError)
                        formatError
                      else if (alertVisibility.displayVerificationCodeError)
                        verificationCodeError,
                      const Text(
                        "Social Income",
                        style: TextStyle(color: Colors.white, fontSize: 36),
                      ),
                      if (keyboardVisible())
                        Image(
                          image: const AssetImage("assets/phone.png"),
                          height: MediaQuery.of(context).size.height * 0.4,
                        ),
                      if (keyboardVisible())
                        const Text(
                          "Universal Basic Income\nfrom Human to Human",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: input,
                      )
                    ],
                  ),
                ),
              ),
              if (alertVisibility.displayContact) const SocialIncomeContact(),
            ],
          ),
        );
      },
    );
  }
}
