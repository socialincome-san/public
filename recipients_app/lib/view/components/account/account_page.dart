import "package:app/models/alert_visibility.dart";
import "package:app/models/current_user.dart";
import "package:app/services/auth_service.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/components/account/changeable_user_information.dart";
import "package:app/view/components/account/unchangeable_user_information.dart";
import "package:app/view/components/social_income_contact.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/material.dart";
import "package:provider/provider.dart";

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<CurrentUser, AlertVisibility>(
      builder: (context, currentUser, alertVisibility, child) {
        const firstNameCard = ChangeableUserInformation("First Name");
        const lastNameCard = ChangeableUserInformation("Last Name");
        const preferredNameCard = ChangeableUserInformation("Preferred Name");
        const dateOfBirthCard = ChangeableUserInformation("Date of Birth");
        const emailCard = ChangeableUserInformation("Email");
        const phoneCard = ChangeableUserInformation("Phone Number");
        return Stack(
          children: [
            Container(
              margin: AppSpacings.h16,
              child: ListView(
                children: [
                  // Suitable for small number of widgets?
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Center(
                      child: Text(
                        "Basic Information",
                        style: TextStyle(fontWeight: FontWeight.bold),
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
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  UnchangeableUserInformation(
                    "Recipient Since",
                    AuthService().createdAt(),
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
                      child: Text(
                        "Support",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  ButtonOutlinedBig(
                    onPressed: () {
                      alertVisibility.setContactVisibility(true);
                    },
                    label: "Get in touch",
                  ),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Center(
                      child: Text(
                        "Account",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),

                  ElevatedButton(
                    onPressed: () async {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const WelcomePage(),
                        ),
                      ).then((value) => FirebaseAuth.instance.signOut());
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
      },
    );
  }
}
