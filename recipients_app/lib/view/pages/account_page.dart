import "package:app/core/cubits/account/account_cubit.dart";
import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/phone.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:app/view/widgets/account/unchangeable_user_information.dart";
import "package:app/view/widgets/dialogs/social_income_contact_dialog.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

/// TODO: add dialog for contact
class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

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

class _AccountView extends StatefulWidget {
  const _AccountView();

  @override
  State<_AccountView> createState() => _AccountViewState();
}

class _AccountViewState extends State<_AccountView> {
  late final TextEditingController _birthDateController;

  @override
  void initState() {
    super.initState();
    _birthDateController = TextEditingController();
  }

  @override
  void dispose() {
    _birthDateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AccountCubit, AccountState>(
      builder: (context, state) {
        final currentUser = state.recipient;

        _birthDateController.text =
            getFormattedDate(currentUser.birthDate) ?? "";

        return Scaffold(
          appBar: AppBar(
            title: const Text("Profile"),
            elevation: 0,
          ),
          body: ListView(
            padding: AppSpacings.a16,
            children: [
              const Text(
                "Basic Information",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              UnchangeableUserInformation(
                section: "First name",
                placeHolder: currentUser.firstName ?? "",
              ),
              UnchangeableUserInformation(
                section: "Last name",
                placeHolder: currentUser.lastName ?? "",
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: currentUser.preferredName ?? "",
                decoration: const InputDecoration(
                  labelText: "Preferred name",
                ),
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(preferredName: value),
                        ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _birthDateController,
                decoration: const InputDecoration(
                  labelText: "Date of birth",
                ),
                readOnly: true,
                onTap: () async => showDatePicker(
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
                }),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: currentUser.email ?? "",
                decoration: const InputDecoration(
                  labelText: "Email",
                ),
                keyboardType: TextInputType.emailAddress,
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(email: value),
                        ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: currentUser.communicationMobilePhone?.phoneNumber
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
                          communicationMobilePhone: Phone(newPhoneNumber),
                        ),
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
                section: "Recipient Since",
                placeHolder: state.recipient.recipientSince != null
                    ? DateFormat("dd.MM.yyyy")
                        .format(state.recipient.recipientSince!)
                    : "",
              ),
              UnchangeableUserInformation(
                section: "Country",
                placeHolder: currentUser.country ?? "",
              ),
              UnchangeableUserInformation(
                section: "Orange Money Number",
                placeHolder:
                    currentUser.mobileMoneyPhone?.phoneNumber.toString() ?? "",
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
                onPressed: () => showDialog(
                  context: context,
                  builder: (BuildContext context) =>
                      const SocialIncomeContactDialog(),
                ),
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
          // if (state.status == AccountStatus.loading) ...[
          //   Container(
          //     alignment: Alignment.center,
          //     child: const CircularProgressIndicator(),
          //   ),
          // ]
          // ],
          // ),
        );
      },
    );
  }

  String? getFormattedDate(Timestamp? timestamp) {
    if (timestamp == null) return null;
    return DateFormat("dd.MM.yyyy").format(timestamp.toDate());
  }
}
