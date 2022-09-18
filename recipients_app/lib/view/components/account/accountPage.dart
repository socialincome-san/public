import 'package:app/models/alertVisibility.dart';
import 'package:app/models/currentUser.dart';
import 'package:app/services/authService.dart';
import 'package:app/theme/theme.dart';
import 'package:app/view/components/account/changeableUserInformation.dart';
import 'package:app/view/components/account/unchangeableUserInformation.dart';
import 'package:app/view/pages/welcomePage.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../socialIncomeContact.dart';

class AccountPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer2<CurrentUser, AlertVisibility>(
        builder: (context, currentUser, alertVisibility, child) {
      var firstNameCard = ChangeableUserInformation("First Name");
      var lastNameCard = ChangeableUserInformation("Last Name");
      var preferredNameCard = ChangeableUserInformation("Preferred Name");
      var dateOfBirthCard = ChangeableUserInformation("Date of Birth");
      var emailCard = ChangeableUserInformation("Email");
      var phoneCard = ChangeableUserInformation("Phone Number");
      return Stack(
        children: [
          Container(
            margin: EdgeInsets.only(left: 16, right: 16),
            child: ListView(
              children: [
                // Suitable for small number of widgets?
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Center(
                    child: Text(
                      "Basic Information",
                      style: (TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
                firstNameCard,
                lastNameCard,
                preferredNameCard,
                dateOfBirthCard,
                emailCard,
                phoneCard,
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Center(
                    child: Text(
                      "Further Information",
                      style: (TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
                UnchangeableUserInformation(
                  "Recipient Since",
                  AuthService.instance()?.createdAt() ?? "",
                ),
                UnchangeableUserInformation(
                  "Amount Received",
                  "SLE " + currentUser.totalIncome().toString(),
                ),
                UnchangeableUserInformation(
                  "Country",
                  currentUser.country ?? "",
                ),
                UnchangeableUserInformation(
                  "Orange Money Number",
                  currentUser.orangePhoneNumber ?? "",
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Center(
                    child: Text("Support",
                        style: (TextStyle(fontWeight: FontWeight.bold))),
                  ),
                ),
                OutlinedButton(
                  style: ElevatedButton.styleFrom(
                    side: BorderSide(
                      width: 1.0,
                      color: siDarkBlue,
                    ),
                  ),
                  onPressed: () {
                    alertVisibility.setContactVisibility(true);
                  },
                  child: Text("Get in touch",
                      style: TextStyle(color: Colors.black)),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Center(
                    child: Text(
                      "Account",
                      style: (TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),

                ElevatedButton(
                  onPressed: () async {
                    Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                                builder: (context) => WelcomePage()))
                        .then((value) => FirebaseAuth.instance.signOut());
                  },
                  child: Text("Sign Out"),
                ),
                SizedBox(
                  height: 1,
                )
              ],
            ),
          ),
          if (alertVisibility.displayContact) SocialIncomeContact(),
        ],
      );
    });
  }
}
