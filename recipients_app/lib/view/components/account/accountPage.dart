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
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<CurrentUser, AlertVisibility>(
        builder: (context, currentUser, alertVisibility, child) {
      var firstNameCard = const ChangeableUserInformation("First Name");
      var lastNameCard = const ChangeableUserInformation("Last Name");
      var preferredNameCard = const ChangeableUserInformation("Preferred Name");
      var dateOfBirthCard = const ChangeableUserInformation("Date of Birth");
      var emailCard = const ChangeableUserInformation("Email");
      var phoneCard = const ChangeableUserInformation("Phone Number");
      return Stack(
        children: [
          Container(
            margin: const EdgeInsets.only(left: 16, right: 16),
            child: ListView(
              children: [
                // Suitable for small number of widgets?
                const ListTile(
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
                const ListTile(
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
                  AuthService.instance().createdAt(),
                ),
                UnchangeableUserInformation(
                  "Amount Received",
                  "SLE ${currentUser.totalIncome()}",
                ),
                UnchangeableUserInformation(
                  "Country",
                  currentUser.country ?? "",
                ),
                UnchangeableUserInformation(
                  "Orange Money Number",
                  currentUser.orangePhoneNumber ?? "",
                ),
                const ListTile(
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
                  child: const Text("Get in touch",
                      style: TextStyle(color: Colors.black)),
                ),
                const ListTile(
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
                                builder: (context) => const WelcomePage()))
                        .then((value) => FirebaseAuth.instance.signOut());
                  },
                  child: const Text("Sign Out"),
                ),
                const SizedBox(
                  height: 1,
                )
              ],
            ),
          ),
          if (alertVisibility.displayContact) const SocialIncomeContact(),
        ],
      );
    });
  }
}
