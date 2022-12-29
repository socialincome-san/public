import 'package:app/models/currentUser.dart';
import 'package:app/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher_string.dart';

class TermsAndConditions extends StatelessWidget {
  const TermsAndConditions({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(builder: (context, currentUser, child) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        // Children will expand to fill crossAxis
        children: <Widget>[
          // Phone Number Text Field
          Padding(
            padding: edgeInsetsAll12,
            child: const Text("Welcome to Social Income",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w400)),
          ),

          Padding(
              padding: edgeInsetsAll12,
              child: const Text(
                  "To give you the best experience, we use data from your device to",
                  style: TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w500, height: 1.4))),
          Padding(
              padding: const EdgeInsets.all(25),
              child: Column(children: const [
                _IconAndText("Make the app work and provide our services",
                    Icons.remember_me),
                _IconAndText("Improve service performance by use of analytics",
                    Icons.poll),
                _IconAndText("Read our privacy policy", Icons.policy)
              ])),
          const Spacer(),
          Padding(
            padding: edgeInsetsAll12,
            child: ElevatedButton(
                onPressed: () {
                  currentUser.acceptTerms();
                },
                child: const Text('Accept')),
          )
        ],
      );
    });
  }
}

class _IconAndText extends StatelessWidget {
  final IconData icon;
  final String text;
  const _IconAndText(this.text, this.icon);

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisAlignment: MainAxisAlignment.start, children: [
      Icon(icon, size: 36, color: Colors.grey[700]),
      Flexible(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: text == "Read our privacy policy"
              ? TextButton(
                  style: TextButton.styleFrom(padding: const EdgeInsets.all(0)),
                  onPressed: () async {
                    const url = 'https://socialincome.org/privacy';
                    if (await canLaunchUrlString(url)) {
                      await launchUrlString(url);
                    } else {
                      throw 'Could not launch $url';
                    }
                  },
                  child: Text(text,
                      style: const TextStyle(
                          decoration: TextDecoration.underline,
                          fontSize: 18,
                          color: Colors.black,
                          fontWeight: FontWeight.w500,
                          height: 1.4)),
                )
              : Text(text,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w500, height: 1.4)),
        ),
      ),
    ]);
  }
}
