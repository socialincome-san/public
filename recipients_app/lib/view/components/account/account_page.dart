import "package:app/account/cubit/account_cubit.dart";
import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/services/auth_service.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/components/account/changeable_user_information.dart";
import "package:app/view/components/account/unchangeable_user_information.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

/// TODO: add dialog for contact
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AccountCubit(
        recipient: context.read<AuthCubit>().state.recipient!,
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
    // TODO: check what needs to be changed here and how and apply cubit logic
    return BlocConsumer<AccountCubit, AccountState>(
      listener: (context, state) {},
      builder: (context, state) {
        final currentUser = state.recipient;

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
                  UnchangeableUserInformation(
                    "First name",
                    currentUser.firstName ?? "",
                  ),
                  UnchangeableUserInformation(
                    "Last name",
                    currentUser.lastName ?? "",
                  ),
                  TextFormField(
                    initialValue: currentUser.preferredName ?? "",
                    decoration: const InputDecoration(
                      labelText: "Preferred name",
                    ),
                    onChanged: (value) {
                      context.read<AccountCubit>().updateRecipient(
                            currentUser.copyWith(preferredName: value),
                          );
                    },
                  ),
                  const ChangeableUserInformation(
                    "Preferred name",
                  ),
                  const ChangeableUserInformation(
                    "Date of birth",
                  ),
                  const ChangeableUserInformation(
                    "Email",
                  ),
                  const ChangeableUserInformation(
                    "Phone number",
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
                  ButtonOutlinedBig(
                    onPressed: () {
                      // alertVisibility.setContactVisibility(true);
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
                  ButtonBig(
                    isLoading: state.status == AccountStatus.loading,
                    onPressed: () => context.read<AuthCubit>().logout(),
                    label: "Sign Out",
                  ),
                ],
              ),
            ),
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
