import 'package:app/models/alertVisibility.dart';
import 'package:app/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class SocialIncomeContact extends StatelessWidget {
  void openPhone(number) async {}
  void openEmail(address) async {}

  @override
  Widget build(BuildContext context) {
    Function _openWhatsapp = (number) async {
      var whatsappURL = "whatsapp://send?phone=$number&text=hello";
      if (await canLaunch(whatsappURL)) {
        await launch(whatsappURL);
      } else {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: new Text("whatsapp no installed")));
      }
    };

    Function _makePhoneCall = (String phoneNumber) async {
      final Uri launchUri = Uri(
        scheme: 'tel',
        path: phoneNumber,
      );
      await launch(launchUri.toString());
    };

    Function _writeEmail = (String emailAdress) async {
      final Uri launchUri = Uri(
        scheme: 'mailto',
        path: emailAdress,
      );
      await launch(launchUri.toString());
    };

    return Consumer<AlertVisibility>(
        builder: (context, alertVisibility, child) {
      return Center(
        child: Container(
          decoration: BoxDecoration(
            color: backgroundColor,
            border: Border.all(
              width: 1,
              color: Theme.of(context).primaryColor,
            ),
          ),
          height: MediaQuery.of(context).size.height * 0.75,
          width: MediaQuery.of(context).size.width * 0.9,
          child: Padding(
              padding: edgeInsetsAll12,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Column(children: [
                    Image(
                      image: AssetImage('assets/team.png'),
                      width: MediaQuery.of(context).size.width * 0.6,
                    ),
                    Text("Support Team", style: TextStyle(fontSize: 24)),
                    Text("Get in touch with us",
                        style: TextStyle(fontSize: 15, color: Colors.grey))
                  ]),
                  _IconAndContact(
                      "Whatsapp", "+41 76 251 55 69", _openWhatsapp),
                  _IconAndContact("Phone", "+232 75 588647", _makePhoneCall),
                  _IconAndContact(
                      "Email", "support@socialincome.org", _writeEmail),
                  ElevatedButton(
                    onPressed: () {
                      alertVisibility.setContactVisibility(false);
                    },
                    child: Text("Close"),
                    style: ElevatedButton.styleFrom(
                        primary: Theme.of(context).primaryColor,
                        minimumSize: Size(200, 60)),
                  )
                ],
              )),
        ),
      );
    });
  }
}

class _IconAndContact extends StatelessWidget {
  final String contactMethod;
  final String contactDetails;
  final Function open;

  _IconAndContact(this.contactMethod, this.contactDetails, this.open);

  final edgeinsets = const EdgeInsets.fromLTRB(8, 0, 8, 0);
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Padding(
            padding: edgeinsets,
            child: Icon(Icons.check_circle_rounded,
                color: Theme.of(context).primaryColor, size: 30)),
        Padding(
          padding: edgeinsets,
          child: Column(
            children: [
              TextButton(
                onPressed: () {
                  this.open(contactDetails.trim());
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contactMethod,
                      style: TextStyle(fontSize: 18, color: Colors.black),
                    ),
                    Text(
                      contactDetails,
                      style: TextStyle(fontSize: 15, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ],
          ),
        )
      ],
    );
  }
}
