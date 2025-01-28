import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/demo_manager.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/gestures.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";
import "package:url_launcher/url_launcher_string.dart";

class TermsAndConditionsPage extends StatelessWidget {
  const TermsAndConditionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final demoManager = RepositoryProvider.of<DemoManager>(context);

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(localizations.account),
        centerTitle: true,
      ),
      body: Padding(
        padding: AppSpacings.a16,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: localizations.createAccountInfo,
                          style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                                color: AppColors.primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        TextSpan(
                          text: localizations.privacyPolicy,
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
                                  // Don't use 'BuildContext's across async gaps. Try rewriting the code to not use the 'BuildContext', or guard the use with a 'mounted' check.
                                  if (context.mounted) {
                                    FlushbarHelper.showFlushbar(
                                      context,
                                      message: localizations.privacyPolicyError,
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
                  const SizedBox(
                    height: 200,
                  ),
                ],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ButtonBig(
                  onPressed: () {
                    final updated = context.read<AuthCubit>().state.recipient?.copyWith(
                          termsAccepted: true,
                        );

                    if (updated != null) {
                      context.read<AuthCubit>().updateRecipient(updated);
                    }
                  },
                  label: demoManager.isDemoEnabled ? localizations.createAccountDemo : localizations.createAccount,
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
