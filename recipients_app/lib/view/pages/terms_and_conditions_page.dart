import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/offline_exception.dart";
import "package:app/demo_manager.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/inputs/input_text.dart";
import "package:flutter/gestures.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:url_launcher/url_launcher_string.dart";

class TermsAndConditionsPage extends StatefulWidget {
  const TermsAndConditionsPage({super.key});

  @override
  State<TermsAndConditionsPage> createState() => _TermsAndConditionsPageState();
}

class _TermsAndConditionsPageState extends State<TermsAndConditionsPage> {
  late final TextEditingController _successorNameController;

  @override
  void initState() {
    super.initState();
    _successorNameController = TextEditingController(
      text: context.read<AuthCubit>().state.recipient?.successorName ?? "",
    );
  }

  @override
  void dispose() {
    _successorNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final demoManager = context.read<DemoManager>();

    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.status == AuthStatus.updateRecipientFailure) {
          FlushbarHelper.showFlushbar(
            context,
            message: state.exception is OfflineMutationException
                ? context.l10n.offlineMutationError
                : context.l10n.profileUpdateError,
            type: FlushbarType.error,
          );
        }
      },
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          elevation: 0,
          title: Text(context.l10n.account),
          leading: BackButton(
            onPressed: () {
              context.read<AuthCubit>().logout();
            },
          ),
          centerTitle: true,
        ),
        body: Padding(
          padding: AppSpacings.a16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 32),
                      RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: context.l10n.acceptAndContinueInfo,
                              style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                                color: AppColors.primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            TextSpan(
                              text: context.l10n.privacyPolicy,
                              style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                                color: AppColors.primaryColor,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () async {
                                  const url = "https://socialincome.org/privacy";
                                  if (await canLaunchUrlString(url)) {
                                    await launchUrlString(url);
                                  } else {
                                    Clipboard.setData(
                                      const ClipboardData(
                                        text: "https://socialincome.org/privacy",
                                      ),
                                    ).then((_) {
                                      if (context.mounted) {
                                        FlushbarHelper.showFlushbar(
                                          context,
                                          message: context.l10n.privacyPolicyError,
                                          type: FlushbarType.error,
                                        );
                                      }
                                    });
                                  }
                                },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      Text(
                        context.l10n.inCaseOfDeathTitle,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        context.l10n.inCaseOfDeathDescription,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 16),
                      InputText(
                        hintText: context.l10n.successorName,
                        controller: _successorNameController,
                        keyboardType: TextInputType.name,
                      ),
                    ],
                  ),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ButtonBig(
                    isLoading: state.status == AuthStatus.updatingRecipient,
                    onPressed: () {
                      final successorName = _successorNameController.text.trim();
                      context.read<AuthCubit>().updateRecipient(
                        selfUpdate: RecipientSelfUpdate(
                          termsAccepted: true,
                          successorName: successorName,
                        ),
                      );
                    },
                    label: demoManager.isDemoEnabled
                        ? context.l10n.acceptAndContinueDemo
                        : context.l10n.acceptAndContinue,
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
