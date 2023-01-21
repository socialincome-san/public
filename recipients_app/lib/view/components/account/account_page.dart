import "package:app/account/cubit/account_cubit.dart";
import "package:app/account/repository/account_repository.dart";
import "package:app/models/alert_visibility.dart";
import "package:app/models/current_user.dart";
import "package:app/services/auth_service.dart";
import "package:app/services/database_service.dart";
import "package:app/theme/theme.dart";
import "package:app/view/components/account/changeable_user_information.dart";
import "package:app/view/components/account/unchangeable_user_information.dart";
import "package:app/view/components/social_income_contact.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:provider/provider.dart";

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (_) => AccountRepository(DatabaseService()),
      child: BlocProvider(
        create: (context) => AccountCubit(
          accountRepository: RepositoryProvider.of<AccountRepository>(context),
        )..fetchUser(),
        child: const AccountPage(),
      ),
    );
  }
}

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AccountCubit, AccountState>(
      listener: (context, state) {},
      builder: (context, state) {
        // const firstNameCard = ChangeableUserInformation("First Name");
        // const lastNameCard = ChangeableUserInformation("Last Name");
        // const preferredNameCard = ChangeableUserInformation("Preferred Name");
        // const dateOfBirthCard = ChangeableUserInformation("Date of Birth");
        // const emailCard = ChangeableUserInformation("Email");
        // const phoneCard = ChangeableUserInformation("Phone Number");
        final userAccount = state.userAccount;
        return Stack(
          children: [
            if (userAccount != null) ...[
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
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    UnchangeableUserInformation(
                      "First name",
                      userAccount.firstName,
                    ),
                    UnchangeableUserInformation(
                      "Last name",
                      userAccount.lastName,
                    ),
                    UnchangeableUserInformation(
                      "Preferred name",
                      userAccount.preferredName,
                    ),
                    UnchangeableUserInformation(
                      "Date of birth",
                      "${userAccount.birthDate}",
                    ),
                    UnchangeableUserInformation(
                      "Email",
                      userAccount.email,
                    ),
                    UnchangeableUserInformation(
                      "Phone number",
                      userAccount.phone,
                    ),
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
                      AuthService()
                          .createdAt(), // TODO - check it, we probably should use different field?
                    ),
                    UnchangeableUserInformation(
                      "Country",
                      userAccount.country,
                    ),
                    UnchangeableUserInformation(
                      "Orange Money Number",
                      userAccount.orangePhone,
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
                    OutlinedButton(
                      style: ElevatedButton.styleFrom(
                        side: BorderSide(
                          color: siDarkBlue,
                        ),
                      ),
                      onPressed: () {
                        // alertVisibility.setContactVisibility(true);
                      },
                      child: const Text(
                        "Get in touch",
                        style: TextStyle(color: Colors.black),
                      ),
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
            ],
            if (state.status == AccountStatus.loading) ...[
              Container(
                alignment: Alignment.center,
                child: const CircularProgressIndicator(),
              ),
            ]
            // if (alertVisibility.displayContact) const SocialIncomeContact(),
          ],
        );
      },
    );
  }
}
