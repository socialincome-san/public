import "package:app/account/cubit/account_cubit.dart";
import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/models/recipient.dart";
import "package:app/services/auth_service.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/components/account/unchangeable_user_information.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

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
      child: _AccountView(),
    );
  }
}

class _AccountView extends StatelessWidget {
  _AccountView();

  final _birthDateController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    // TODO: check what needs to be changed here and how and apply cubit logic
    return BlocConsumer<AccountCubit, AccountState>(
      listener: (context, state) {},
      builder: (context, state) {
        final currentUser = state.recipient;

        _birthDateController.text =
            getFormattedDate(currentUser.birthDate) ?? "";

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
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _birthDateController,
                    decoration: const InputDecoration(
                      labelText: "Date of birth",
                    ),
                    readOnly: true,
                    onTap: () async {
                      showDatePicker(
                        firstDate: DateTime(1950),
                        lastDate: DateTime(DateTime.now().year - 10),
                        initialDate:
                            currentUser.birthDate?.toDate() ?? DateTime(2000),
                        context: context,
                      ).then((value) {
                        if (value != null) {
                          context.read<AccountCubit>().updateRecipient(
                                currentUser.copyWith(
                                  birthDate: Timestamp.fromDate(value),
                                ),
                              );
                        }
                        return;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    initialValue: currentUser.email ?? "",
                    decoration: const InputDecoration(
                      labelText: "Email",
                    ),
                    keyboardType: TextInputType.emailAddress,
                    onChanged: (value) {
                      context.read<AccountCubit>().updateRecipient(
                            currentUser.copyWith(email: value),
                          );
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    initialValue: currentUser.communicationMobilePhone?.phone
                            .toString() ??
                        "",
                    decoration: const InputDecoration(
                      labelText: "Phone number",
                    ),
                    keyboardType: TextInputType.phone,
                    onChanged: (value) {
                      final newPhoneNumber = int.tryParse(value);
                      if (newPhoneNumber == null) return;
                      context.read<AccountCubit>().updateRecipient(
                            currentUser.copyWith(
                                communicationMobilePhone:
                                    Phone(newPhoneNumber)),
                          );
                    },
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

  String? getFormattedDate(Timestamp? timestamp) {
    if (timestamp == null) return null;
    return DateFormat("dd.MM.yyyy").format(timestamp.toDate());
  }
}
