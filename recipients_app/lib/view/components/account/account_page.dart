import "package:app/account/cubit/account_cubit.dart";
import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/services/auth_service.dart";
import "package:app/theme/theme.dart";
import "package:app/view/components/account/unchangeable_user_information.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AccountCubit(
        userRepository: context.read<UserRepository>(),
      ),
      child: const _AccountView(),
    );
  }
}

class _AccountView extends StatelessWidget {
  const _AccountView();

  @override
  Widget build(BuildContext context) {
    final currentUser = context.watch<AuthCubit>().state.recipient;

    // TODO: check what needs to be changed here and how and apply cubit logic
    return BlocConsumer<AccountCubit, AccountState>(
      listener: (context, state) {},
      builder: (context, state) {
        return Stack(
          children: [
            if (currentUser != null) ...[
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
                      currentUser.firstName ?? "",
                    ),
                    UnchangeableUserInformation(
                      "Last name",
                      currentUser.lastName ?? "",
                    ),
                    UnchangeableUserInformation(
                      "Preferred name",
                      currentUser.preferredName ?? "",
                    ),
                    UnchangeableUserInformation(
                      "Date of birth",
                      "${currentUser.birthDate}",
                    ),
                    UnchangeableUserInformation(
                      "Email",
                      currentUser.email ?? "",
                    ),
                    UnchangeableUserInformation(
                      "Phone number",
                      currentUser.communicationMobilePhone?.phone.toString() ??
                          "",
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
                      currentUser.country ?? "",
                    ),
                    UnchangeableUserInformation(
                      "Orange Money Number",
                      currentUser.mobileMoneyPhone?.phone.toString() ?? "",
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
                      onPressed: () => context.read<AuthCubit>().logout(),
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
