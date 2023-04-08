import "package:app/core/cubits/account/account_cubit.dart";
import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/models.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:app/ui/inputs/input_text.dart";
import "package:app/view/widgets/dialogs/social_income_contact_dialog.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

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
  late final TextEditingController _nameController;
  late final TextEditingController _surnameController;
  late final TextEditingController _callingNameController;
  late final TextEditingController _paymentNumberController;
  late final TextEditingController _contactNumberController;
  late final TextEditingController _emailController;

  Recipient? _recipient;

  @override
  void initState() {
    super.initState();

    _recipient = context.read<AccountCubit>().state.recipient;

    _nameController = TextEditingController(
      text: _recipient?.firstName ?? "",
    );
    _surnameController = TextEditingController(
      text: _recipient?.lastName ?? "",
    );
    _callingNameController = TextEditingController(
      text: _recipient?.preferredName ?? "",
    );
    _birthDateController = TextEditingController(
      text: getFormattedDate(_recipient?.birthDate) ?? "",
    );
    _emailController = TextEditingController(
      text: _recipient?.email ?? "",
    );

    _paymentNumberController = TextEditingController(
      text: _recipient?.mobileMoneyPhone?.phoneNumber.toString() ?? "",
    );
    _contactNumberController = TextEditingController(
      text: _recipient?.communicationMobilePhone?.phoneNumber.toString() ?? "",
    );
  }

  @override
  void dispose() {
    _birthDateController.dispose();
    _nameController.dispose();
    _surnameController.dispose();
    _callingNameController.dispose();
    _paymentNumberController.dispose();
    _contactNumberController.dispose();
    _emailController.dispose();

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
            centerTitle: true,
            elevation: 0,
          ),
          body: ListView(
            padding: AppSpacings.a16,
            children: [
              Text(
                "Personal",
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              InputText(
                hintText: "Name*",
                controller: _nameController,
                validator: (value) =>
                    value!.isEmpty ? "Please enter your name" : null,
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(
                            firstName: value,
                          ),
                        ),
              ),
              const SizedBox(height: 16),
              InputText(
                controller: _surnameController,
                hintText: "Surname*",
                validator: (value) =>
                    value!.isEmpty ? "Please enter your surname" : null,
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(
                            lastName: value,
                          ),
                        ),
              ),
              const SizedBox(height: 16),
              InputText(
                controller: _callingNameController,
                hintText: "Calling Name",
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(
                            preferredName: value,
                          ),
                        ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                hint: const Text("Gender*"),
                items: [
                  const DropdownMenuItem(
                    child: Text("Male"),
                    value: "male",
                  ),
                  const DropdownMenuItem(
                    child: Text("Female"),
                    value: "female",
                  ),
                  const DropdownMenuItem(
                    child: Text("Other"),
                    value: "other",
                  ),
                ],
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(
                            gender: value,
                          ),
                        ),
                validator: (value) =>
                    value!.isEmpty ? "Please select a gender" : null,
              ),
              const SizedBox(height: 16),
              InputText(
                hintText: "Date of birth*",
                controller: _birthDateController,
                isReadOnly: true,
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
                suffixIcon: const Icon(
                  Icons.calendar_today,
                  color: AppColors.primaryColor,
                ),
                validator: (value) =>
                    value!.isEmpty ? "Please enter your date of birth" : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                hint: const Text("Language*"),
                items: [
                  const DropdownMenuItem(
                    child: Text("English"),
                    value: "english",
                  ),
                  const DropdownMenuItem(
                    child: Text("Krio"),
                    value: "krio",
                  ),
                ],
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(selectedLanguage: value),
                        ),
                validator: (value) =>
                    value!.isEmpty ? "Please select a language" : null,
              ),
              const SizedBox(height: 16),
              InputText(
                hintText: "Email",
                controller: _emailController,
                onChanged: (value) =>
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(email: value),
                        ),
              ),
              const SizedBox(height: 24),
              Text(
                "Payment Phone",
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              InputText(
                hintText: "Payment Number*",
                controller: _paymentNumberController,
                onChanged: (value) {
                  if (value != null && value.isNotEmpty) {
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(
                            mobileMoneyPhone: Phone(int.parse(value)),
                          ),
                        );
                  }
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Please enter your phone number";
                  }

                  if (int.tryParse(value) == null) {
                    return "Please enter a valid phone number. Only numbers are allowed";
                  }

                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                hint: const Text("Mobile Payment Provider*"),
                items: [
                  const DropdownMenuItem(
                    child: Text("Orange Money SL"),
                    value: "orange_money_sl",
                  ),
                ],
                onChanged: (value) => context
                    .read<AccountCubit>()
                    .updateRecipient(
                        currentUser.copyWith(paymentProvider: value)),
                validator: (value) =>
                    value!.isEmpty ? "Please select a payment provider" : null,
              ),
              const SizedBox(height: 24),

              /// CONTACT PHONE
              Text(
                "Contact Phone",
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              InputText(
                hintText: "Contact Number*",
                controller: _contactNumberController,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Please enter your contact phone number";
                  }

                  if (int.tryParse(value) == null) {
                    return "Please enter a valid phone number. Only numbers are allowed";
                  }

                  return null;
                },
                onChanged: (value) {
                  if (value != null && value.isNotEmpty)
                    context.read<AccountCubit>().updateRecipient(
                          currentUser.copyWith(
                            communicationMobilePhone: Phone(
                              int.parse(value),
                            ),
                          ),
                        );
                },
              ),
              // TODO add later
              /*const SizedBox(height: 8),
               DropdownButtonFormField<String>(
                hint: const Text("Contact Preference*"),
                onChanged: (value) => context
                    .read<AccountCubit>()
                    .updateRecipient(
                        currentUser.copyWith(contactPreference: value)),
                items: [
                  const DropdownMenuItem(
                    child: Text("WhatsApp"),
                    value: "whatsapp",
                  ),
                ],
                validator: (value) => value!.isEmpty
                    ? "Please select a contact preference"
                    : null,
              ), */

              /// RECOMMENDING ORGA
              const SizedBox(height: 24),
              Text(
                "Recommending Organization",
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: AppSpacings.a12,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.lock,
                            color: Colors.black,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "Organization Name",
                            style: Theme.of(context)
                                .textTheme
                                .bodyLarge!
                                .copyWith(fontWeight: FontWeight.bold),
                          ),
                          const Spacer(),
                          ButtonSmall(
                            label: "Call",
                            buttonType: ButtonSmallType.outlined,
                            color: Colors.black,
                            onPressed: () {
                              // TODO implement
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Petra Mustermann",
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      Text(
                        "0827183978321",
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
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
        );
      },
    );
  }

  String? getFormattedDate(Timestamp? timestamp) {
    if (timestamp == null) return null;
    return DateFormat("dd.MM.yyyy").format(timestamp.toDate());
  }
}
