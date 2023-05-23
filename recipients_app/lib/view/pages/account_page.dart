import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/models.dart";
import "package:app/data/models/organization.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:app/ui/inputs/input_dropdown.dart";
import "package:app/ui/inputs/input_text.dart";
import "package:app/view/widgets/account/organization_info.dart";
import "package:app/view/widgets/dialogs/social_income_contact_dialog.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

class AccountPage extends StatefulWidget {
  final Recipient recipient;
  final Organization? organization;

  const AccountPage({
    required this.recipient,
    this.organization,
  });

  @override
  State<AccountPage> createState() => AccountPageState();
}

class AccountPageState extends State<AccountPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  late final TextEditingController _birthDateController;
  late final TextEditingController _nameController;
  late final TextEditingController _surnameController;
  late final TextEditingController _callingNameController;
  late final TextEditingController _paymentNumberController;
  late final TextEditingController _contactNumberController;
  late final TextEditingController _emailController;

  @override
  void initState() {
    super.initState();

    _nameController = TextEditingController(
      text: widget.recipient.firstName ?? "",
    );
    _surnameController = TextEditingController(
      text: widget.recipient.lastName ?? "",
    );
    _callingNameController = TextEditingController(
      text: widget.recipient.callingName ?? "",
    );
    _birthDateController = TextEditingController(
      text: getFormattedDate(widget.recipient.birthDate) ?? "",
    );
    _emailController = TextEditingController(
      text: widget.recipient.email ?? "",
    );

    _paymentNumberController = TextEditingController(
      text: widget.recipient.mobileMoneyPhone?.phoneNumber.toString() ?? "",
    );
    _contactNumberController = TextEditingController(
      text: widget.recipient.communicationMobilePhone?.phoneNumber.toString() ??
          "",
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
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.status == AuthStatus.updateRecipientSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Profile updated successfully")),
          );
        } else if (state.status == AuthStatus.updateRecipientFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  "Failed to update profile. Please try again or contact our support"),
            ),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: const Text("Profile"),
            centerTitle: true,
            elevation: 0,
          ),
          body: Form(
            key: _formKey,
            autovalidateMode: AutovalidateMode.always,
            child: ListView(
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
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please enter your name";
                    }
                    return null;
                  },
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty)
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(firstName: value),
                          );
                  },
                ),
                const SizedBox(height: 16),
                InputText(
                  controller: _surnameController,
                  hintText: "Surname*",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please enter your surname";
                    }
                    return null;
                  },
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty)
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(
                              lastName: value,
                            ),
                          );
                  },
                ),
                const SizedBox(height: 16),
                InputText(
                  controller: _callingNameController,
                  hintText: "Calling Name",
                  onSubmitted: (value) =>
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(callingName: value),
                          ),
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: "Gender*",
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
                  value: widget.recipient.gender,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please select a gender";
                    }
                    return null;
                  },
                  onChanged: (value) =>
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(
                              gender: value,
                            ),
                          ),
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
                        widget.recipient.birthDate?.toDate() ?? DateTime(2000),
                    context: context,
                  ).then((value) {
                    if (value != null) {
                      final timestamp = Timestamp.fromDate(value);

                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(
                              birthDate: timestamp,
                            ),
                          );
                      _birthDateController.text =
                          getFormattedDate(timestamp) ?? "";
                    }
                    return;
                  }),
                  suffixIcon: const Icon(
                    Icons.calendar_today,
                    color: AppColors.primaryColor,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please enter your date of birth";
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: "Language*",
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
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please select a language";
                    }
                    return null;
                  },
                  onChanged: (value) =>
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(selectedLanguage: value),
                          ),
                  value: widget.recipient.selectedLanguage,
                ),

                const SizedBox(height: 16),
                InputText(
                  hintText: "Email",
                  controller: _emailController,
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty)
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(email: value),
                          );
                  },
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 24),
                Text(
                  "Payment Phone",
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: "Payment Number*",
                  isReadOnly: true,
                  controller: _paymentNumberController,
                  keyboardType: TextInputType.number,
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty) {
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(
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
                InputDropdown<String>(
                  label: "Mobile Payment Provider*",
                  items: [
                    const DropdownMenuItem(
                      child: Text("Orange Money SL"),
                      value: "orange_money_sl",
                    ),
                    const DropdownMenuItem(
                      child: Text("Africell Money"),
                      value: "africell_money",
                    ),
                  ],
                  value: widget.recipient.paymentProvider,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please select a payment provider";
                    }
                    return null;
                  },
                  onChanged: (value) => context
                      .read<AuthCubit>()
                      .updateRecipient(
                          widget.recipient.copyWith(paymentProvider: value)),
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
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please enter your contact phone number";
                    }

                    if (int.tryParse(value) == null) {
                      return "Please enter a valid phone number. Only numbers are allowed";
                    }

                    return null;
                  },
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty)
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(
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
                if (widget.organization != null)
                  OrganizationInfo(organization: widget.organization!),
                const SizedBox(height: 24),
                Text("Support", style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 16),
                const Text(
                    "In case you have any questions or problems, please contact us."),
                const SizedBox(height: 16),
                ButtonBig(
                  onPressed: () => const SocialIncomeContactDialog(),
                  label: "Get in touch",
                ),
                const SizedBox(height: 24),
                Text("Account", style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 16),
                const Text(
                    "In case you want to delete your account, please contact us."),
                const SizedBox(height: 16),
                ButtonBig(
                  onPressed: () => context.read<AuthCubit>().logout(),
                  label: "Sign Out",
                ),
              ],
            ),
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
