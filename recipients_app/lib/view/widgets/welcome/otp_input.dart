import "package:app/view/widgets/welcome/otp_input_field.dart";
import "package:flutter/material.dart";

class OtpInput extends StatefulWidget {
  final Function(String)? onCodeReady;

  const OtpInput({super.key, this.onCodeReady});

  @override
  State<OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<OtpInput> {
  late final TextEditingController digit1Controller;
  late final TextEditingController digit2Controller;
  late final TextEditingController digit3Controller;
  late final TextEditingController digit4Controller;
  late final TextEditingController digit5Controller;
  late final TextEditingController digit6Controller;

  @override
  void initState() {
    super.initState();
    digit1Controller = TextEditingController();
    digit2Controller = TextEditingController();
    digit3Controller = TextEditingController();
    digit4Controller = TextEditingController();
    digit5Controller = TextEditingController();
    digit6Controller = TextEditingController();

    final controllers = [
      digit1Controller,
      digit2Controller,
      digit3Controller,
      digit4Controller,
      digit5Controller,
      digit6Controller,
    ];

    digit1Controller.addListener(() {
      final text = digit1Controller.text;
      if (text.length > 1) {
        for (int i = 0; i < text.length; i++) {
          controllers[i].text = text[i];
        }
      }
    });
  }

  @override
  void dispose() {
    digit1Controller.dispose();
    digit2Controller.dispose();
    digit3Controller.dispose();
    digit4Controller.dispose();
    digit5Controller.dispose();
    digit6Controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        OtpInputField(
          controller: digit1Controller,
          onChanged: (value) {
            if (value?.length == 1) {
              FocusScope.of(context).nextFocus();
            }
            _checkCodeStatus();
          },
          isFirstField: true,
        ),
        OtpInputField(
          controller: digit2Controller,
          onChanged: (value) {
            if (value?.length == 1) {
              FocusScope.of(context).nextFocus();
            } else {
              FocusScope.of(context).previousFocus();
            }
            _checkCodeStatus();
          },
        ),
        OtpInputField(
          controller: digit3Controller,
          onChanged: (value) {
            if (value?.length == 1) {
              FocusScope.of(context).nextFocus();
            } else {
              FocusScope.of(context).previousFocus();
            }
            _checkCodeStatus();
          },
        ),
        OtpInputField(
          controller: digit4Controller,
          onChanged: (value) {
            if (value?.length == 1) {
              FocusScope.of(context).nextFocus();
            } else {
              FocusScope.of(context).previousFocus();
            }
            _checkCodeStatus();
          },
        ),
        OtpInputField(
          controller: digit5Controller,
          onChanged: (value) {
            if (value?.length == 1) {
              FocusScope.of(context).nextFocus();
            } else {
              FocusScope.of(context).previousFocus();
            }
            _checkCodeStatus();
          },
        ),
        OtpInputField(
          controller: digit6Controller,
          onChanged: (value) {
            if (value?.length == 1) {
              FocusScope.of(context).unfocus();
            } else {
              FocusScope.of(context).previousFocus();
            }
            _checkCodeStatus();
          },
        ),
      ],
    );
  }

  void _checkCodeStatus() {
    if (_verifyFullCodeReady()) {
      final verificationCode =
          digit1Controller.text +
          digit2Controller.text +
          digit3Controller.text +
          digit4Controller.text +
          digit5Controller.text +
          digit6Controller.text;

      // call listener with the full code,
      final onCodeReady = widget.onCodeReady;
      if (onCodeReady != null) {
        onCodeReady(verificationCode);
      }
    }
  }

  bool _verifyFullCodeReady() {
    return digit1Controller.text.isNotEmpty &&
        digit2Controller.text.isNotEmpty &&
        digit3Controller.text.isNotEmpty &&
        digit4Controller.text.isNotEmpty &&
        digit5Controller.text.isNotEmpty &&
        digit6Controller.text.isNotEmpty;
  }
}
