import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/settings/settings_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/models/models.dart";
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
import "package:flutter_gen/gen_l10n/app_localizations.dart";
import "package:intl/intl.dart";
import "package:package_info_plus/package_info_plus.dart";

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

  PackageInfo _packageInfo = PackageInfo(
    appName: "Unknown",
    packageName: "Unknown",
    version: "Unknown",
    buildNumber: "Unknown",
    buildSignature: "Unknown",
    installerStore: "Unknown",
  );

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

    _initAppVersionInfo();
  }

  Future<void> _initAppVersionInfo() async {
    final info = await PackageInfo.fromPlatform();
    setState(() {
      _packageInfo = info;
    });
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
    final localizations = AppLocalizations.of(context)!;

    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.status == AuthStatus.updateRecipientSuccess) {
          FlushbarHelper.showFlushbar(
            context,
            message: localizations.profileUpdateSuccess,
          );
        } else if (state.status == AuthStatus.updateRecipientFailure) {
          FlushbarHelper.showFlushbar(
            context,
            message: localizations.profileUpdateError,
            type: FlushbarType.error,
          );
        } else if (state.status == AuthStatus.unauthenticated) {
          Navigator.of(context).pop();
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Text(localizations.profile),
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
                  localizations.personal,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: localizations.name + "*",
                  controller: _nameController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.nameError;
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
                  hintText: localizations.surname + "*",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.surnameError;
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
                  hintText: localizations.callingName,
                  onSubmitted: (value) =>
                      context.read<AuthCubit>().updateRecipient(
                            widget.recipient.copyWith(callingName: value),
                          ),
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: localizations.gender + "*",
                  items: [
                    DropdownMenuItem(
                      child: Text(localizations.male),
                      value: "male",
                    ),
                    DropdownMenuItem(
                      child: Text(localizations.female),
                      value: "female",
                    ),
                    DropdownMenuItem(
                      child: Text(localizations.other),
                      value: "other",
                    ),
                  ],
                  value: widget.recipient.gender,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.genderError;
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
                  hintText: localizations.dateOfBirth + "*",
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
                      return localizations.dateOfBirthError;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: localizations.language + "*",
                  items: [
                    DropdownMenuItem(
                      child: Text(localizations.english),
                      value: "en",
                    ),
                    DropdownMenuItem(
                      child: Text(localizations.krio),
                      value: "kri",
                    ),
                  ],
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.languageError;
                    }
                    return null;
                  },
                  onChanged: (value) {
                    // change language accordingly
                    context.read<SettingsCubit>().changeLanguage(value!);
                    context.read<AuthCubit>().updateRecipient(
                          widget.recipient.copyWith(selectedLanguage: value),
                        );
                  },
                  value: widget.recipient.selectedLanguage,
                ),

                const SizedBox(height: 16),
                InputText(
                  hintText: localizations.email,
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
                  localizations.paymentPhone,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: localizations.paymentNumber + "*",
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
                      return localizations.paymentNumberError;
                    }

                    if (int.tryParse(value) == null) {
                      return localizations.paymentNumberError2;
                    }

                    return null;
                  },
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: localizations.mobilePaymentProvider + "*",
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
                      return localizations.paymentProviderError;
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
                  localizations.contactPhone,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: localizations.contactNumber + "*",
                  controller: _contactNumberController,
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.contactNumberError;
                    }

                    if (int.tryParse(value) == null) {
                      return localizations.contactNumberError2;
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
                Text(localizations.support,
                    style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 16),
                Text(localizations.supportInfo),
                const SizedBox(height: 16),
                ButtonBig(
                  onPressed: () => const SocialIncomeContactDialog(),
                  label: localizations.getInTouch,
                ),
                const SizedBox(height: 24),
                Text(localizations.account,
                    style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 16),
                Text(localizations.accountInfo),
                const SizedBox(height: 16),
                ButtonBig(
                  onPressed: () => context.read<AuthCubit>().logout(),
                  label: localizations.signOut,
                ),
                const SizedBox(height: 16),
                Text(
                  "${localizations.appVersion} ${_packageInfo.version} (${_packageInfo.buildNumber})",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelSmall,
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
