import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/settings/settings_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/models/models.dart";
import "package:app/l10n/l10n.dart";
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
  late final TextEditingController _successorNameController;
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
    _emailController = TextEditingController(
      text: widget.recipient.email ?? "",
    );
    _birthDateController = TextEditingController(
      text: "",
    );
    _paymentNumberController = TextEditingController(
      text: widget.recipient.mobileMoneyPhone?.phoneNumber.toString() ?? "",
    );
    _contactNumberController = TextEditingController(
      text: widget.recipient.communicationMobilePhone?.phoneNumber.toString() ?? "",
    );
    _successorNameController = TextEditingController(
      text: widget.recipient.successorName ?? "",
    );

    _initAppVersionInfo();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final locale = Localizations.localeOf(context).toLanguageTag();
      _birthDateController.text = getFormattedDate(widget.recipient.birthDate, locale) ?? "";
    });
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
    final locale = Localizations.localeOf(context).toLanguageTag();

    final recipient = context.watch<AuthCubit>().state.recipient ?? widget.recipient;

    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.status == AuthStatus.updateRecipientSuccess) {
          FlushbarHelper.showFlushbar(
            context,
            message: context.l10n.profileUpdateSuccess,
          );
        } else if (state.status == AuthStatus.updateRecipientFailure) {
          FlushbarHelper.showFlushbar(
            context,
            message: context.l10n.profileUpdateError,
            type: FlushbarType.error,
          );
        } else if (state.status == AuthStatus.unauthenticated) {
          Navigator.of(context).pop();
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Text(context.l10n.profile),
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
                  context.l10n.personal,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),

                InputText(
                  hintText: "${context.l10n.name}*",
                  controller: _nameController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.nameError;
                    }
                    return null;
                  },
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty) {
                      context.read<AuthCubit>().updateRecipient(
                            recipient.copyWith(firstName: value),
                          );
                    }
                  },
                ),
                const SizedBox(height: 16),
                InputText(
                  controller: _surnameController,
                  hintText: "${context.l10n.surname}*",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.surnameError;
                    }
                    return null;
                  },
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty) {
                      context.read<AuthCubit>().updateRecipient(
                            recipient.copyWith(
                              lastName: value,
                            ),
                          );
                    }
                  },
                ),
                const SizedBox(height: 16),
                InputText(
                  controller: _callingNameController,
                  hintText: context.l10n.callingName,
                  onSubmitted: (value) => context.read<AuthCubit>().updateRecipient(
                        recipient.copyWith(callingName: value),
                      ),
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: "${context.l10n.gender}*",
                  items: [
                    DropdownMenuItem(
                      value: "male",
                      child: Text(context.l10n.male),
                    ),
                    DropdownMenuItem(
                      value: "female",
                      child: Text(context.l10n.female),
                    ),
                    DropdownMenuItem(
                      value: "other",
                      child: Text(context.l10n.other),
                    ),
                  ],
                  value: recipient.gender,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.genderError;
                    }
                    return null;
                  },
                  onChanged: (value) => context.read<AuthCubit>().updateRecipient(
                        recipient.copyWith(
                          gender: value,
                        ),
                      ),
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: "${context.l10n.dateOfBirth}*",
                  controller: _birthDateController,
                  isReadOnly: true,
                  onTap: () => showDatePicker(
                    firstDate: DateTime(1950),
                    lastDate: DateTime(DateTime.now().year - 10),
                    initialDate: recipient.birthDate?.toDate() ?? DateTime(2000),
                    context: context,
                  ).then((value) {
                    if (value != null) {
                      // Don't use 'BuildContext's across async gaps. Try rewriting the code to not use the 'BuildContext', or guard the use with a 'mounted' check.
                      if (context.mounted) {
                        final timestamp = Timestamp.fromDate(value);

                        context.read<AuthCubit>().updateRecipient(
                              recipient.copyWith(
                                birthDate: timestamp,
                              ),
                            );
                        _birthDateController.text = getFormattedDate(timestamp, locale) ?? "";
                      }
                    }
                    return;
                  }),
                  suffixIcon: const Icon(
                    Icons.calendar_today,
                    color: AppColors.primaryColor,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.dateOfBirthError;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: "${context.l10n.language}*",
                  items: [
                    DropdownMenuItem(
                      value: "en",
                      child: Text(context.l10n.english),
                    ),
                    DropdownMenuItem(
                      value: "kri",
                      child: Text(context.l10n.krio),
                    ),
                  ],
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.languageError;
                    }
                    return null;
                  },
                  onChanged: (value) {
                    // change language accordingly
                    context.read<SettingsCubit>().changeLanguage(value!);
                    context.read<AuthCubit>().updateRecipient(
                          recipient.copyWith(selectedLanguage: value),
                        );
                  },
                  value: recipient.selectedLanguage,
                ),

                const SizedBox(height: 16),
                InputText(
                  hintText: context.l10n.email,
                  controller: _emailController,
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty) {
                      context.read<AuthCubit>().updateRecipient(
                            recipient.copyWith(email: value),
                          );
                    }
                  },
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) return null;

                    final emailRegex = RegExp(
                      r"^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$",
                    );
                    if (!emailRegex.hasMatch(value)) {
                      return context.l10n.errorEmailInvalid;
                    }

                    return null;
                  },
                ),
                const SizedBox(height: 24),
                Text(
                  context.l10n.paymentPhone,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: "${context.l10n.paymentNumber}*",
                  isReadOnly: true,
                  controller: _paymentNumberController,
                  keyboardType: TextInputType.number,
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty) {
                      context.read<AuthCubit>().updateRecipient(
                            recipient.copyWith(
                              mobileMoneyPhone: Phone(int.parse(value)),
                            ),
                          );
                    }
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.paymentNumberError;
                    }

                    if (int.tryParse(value) == null) {
                      return context.l10n.paymentNumberError2;
                    }

                    return null;
                  },
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: "${context.l10n.mobilePaymentProvider}*",
                  items: const [
                    DropdownMenuItem(
                      value: "orange_money_sl",
                      child: Text("Orange Money SL"),
                    ),
                    DropdownMenuItem(
                      value: "africell_money",
                      child: Text("Africell Money"),
                    ),
                  ],
                  value: recipient.paymentProvider,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.paymentProviderError;
                    }
                    return null;
                  },
                  onChanged: (value) => context.read<AuthCubit>().updateRecipient(
                        recipient.copyWith(paymentProvider: value),
                      ),
                ),
                const SizedBox(height: 24),

                /// CONTACT PHONE
                Text(
                  context.l10n.contactPhone,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: "${context.l10n.contactNumber}*",
                  controller: _contactNumberController,
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return context.l10n.contactNumberError;
                    }

                    if (int.tryParse(value) == null) {
                      return context.l10n.contactNumberError2;
                    }

                    return null;
                  },
                  onSubmitted: (value) {
                    if (value != null && value.isNotEmpty) {
                      context.read<AuthCubit>().updateRecipient(
                            recipient.copyWith(
                              communicationMobilePhone: Phone(
                                int.parse(value),
                              ),
                            ),
                          );
                    }
                  },
                ),
                const SizedBox(height: 24),
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

                /// SUCCESSOR IN THE CASE OF DEATH
                Text(
                  context.l10n.inCaseOfDeathTitle,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                Text(
                  context.l10n.inCaseOfDeathDescription,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: context.l10n.successorName,
                  controller: _successorNameController,
                  keyboardType: TextInputType.name,
                  onSubmitted: (value) {
                    context.read<AuthCubit>().updateRecipient(
                          recipient.copyWith(successorName: value),
                        );
                  },
                ),

                /// RECOMMENDING ORGA
                if (widget.organization != null) OrganizationInfo(organization: widget.organization!),
                const SizedBox(height: 24),
                Text(
                  context.l10n.support,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                Text(context.l10n.supportInfo),
                const SizedBox(height: 16),
                ButtonBig(
                  onPressed: () => showDialog(
                    context: context,
                    builder: (context) => const SocialIncomeContactDialog(),
                  ),
                  label: context.l10n.getInTouch,
                ),
                const SizedBox(height: 24),
                Text(
                  context.l10n.account,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                Text(context.l10n.accountInfo),
                const SizedBox(height: 16),
                ButtonBig(
                  onPressed: () => context.read<AuthCubit>().logout(),
                  label: context.l10n.signOut,
                ),
                const SizedBox(height: 16),
                Text(
                  "${context.l10n.appVersion} ${_packageInfo.version} (${_packageInfo.buildNumber})",
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

  String? getFormattedDate(
    Timestamp? timestamp,
    String locale,
  ) {
    if (timestamp == null) return null;
    return DateFormat.yMd(locale).format(timestamp.toDate());
  }
}
