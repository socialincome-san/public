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
    final localizations = AppLocalizations.of(context)!;
    final locale = Localizations.localeOf(context).toLanguageTag();

    final recipient = context.watch<AuthCubit>().state.recipient ?? widget.recipient;

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
                  hintText: "${localizations.name}*",
                  controller: _nameController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.nameError;
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
                  hintText: "${localizations.surname}*",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.surnameError;
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
                  hintText: localizations.callingName,
                  onSubmitted: (value) => context.read<AuthCubit>().updateRecipient(
                        recipient.copyWith(callingName: value),
                      ),
                ),
                const SizedBox(height: 16),
                InputDropdown<String>(
                  label: "${localizations.gender}*",
                  items: [
                    DropdownMenuItem(
                      value: "male",
                      child: Text(localizations.male),
                    ),
                    DropdownMenuItem(
                      value: "female",
                      child: Text(localizations.female),
                    ),
                    DropdownMenuItem(
                      value: "other",
                      child: Text(localizations.other),
                    ),
                  ],
                  value: recipient.gender,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localizations.genderError;
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
                  hintText: "${localizations.dateOfBirth}*",
                  controller: _birthDateController,
                  isReadOnly: true,
                  onTap: () async => showDatePicker(
                    firstDate: DateTime(1950),
                    lastDate: DateTime(DateTime.now().year - 10),
                    initialDate: recipient.birthDate?.toDate() ?? DateTime(2000),
                    context: context,
                  ).then((value) {
                    if (value != null) {
                      final timestamp = Timestamp.fromDate(value);

                      context.read<AuthCubit>().updateRecipient(
                            recipient.copyWith(
                              birthDate: timestamp,
                            ),
                          );
                      _birthDateController.text = getFormattedDate(timestamp, locale) ?? "";
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
                  label: "${localizations.language}*",
                  items: [
                    DropdownMenuItem(
                      value: "en",
                      child: Text(localizations.english),
                    ),
                    DropdownMenuItem(
                      value: "kri",
                      child: Text(localizations.krio),
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
                          recipient.copyWith(selectedLanguage: value),
                        );
                  },
                  value: recipient.selectedLanguage,
                ),

                const SizedBox(height: 16),
                InputText(
                  hintText: localizations.email,
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
                    if (!emailRegex.hasMatch(value)) return localizations.errorEmailInvalid;

                    return null;
                  },
                ),
                const SizedBox(height: 24),
                Text(
                  localizations.paymentPhone,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: "${localizations.paymentNumber}*",
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
                  label: "${localizations.mobilePaymentProvider}*",
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
                      return localizations.paymentProviderError;
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
                  localizations.contactPhone,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                InputText(
                  hintText: "${localizations.contactNumber}*",
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
                Text(
                  localizations.support,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                Text(localizations.supportInfo),
                const SizedBox(height: 16),
                ButtonBig(
                  onPressed: () => showDialog(
                    context: context,
                    builder: (context) => const SocialIncomeContactDialog(),
                  ),
                  label: localizations.getInTouch,
                ),
                const SizedBox(height: 24),
                Text(
                  localizations.account,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
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

  String? getFormattedDate(
    Timestamp? timestamp,
    String locale,
  ) {
    if (timestamp == null) return null;
    return DateFormat.yMd(locale).format(timestamp.toDate());
  }
}
