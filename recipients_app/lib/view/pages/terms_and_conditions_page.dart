import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/gestures.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:url_launcher/url_launcher_string.dart";

class TermsAndConditionsPage extends StatelessWidget {
  const TermsAndConditionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text("Account"),
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
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      children: [
                        TextSpan(
                            text: "By creating an account, you agree with our ",
                            style: Theme.of(context)
                                .textTheme
                                .headlineLarge!
                                .copyWith(
                                  color: AppColors.primaryColor,
                                  fontWeight: FontWeight.bold,
                                )),
                        TextSpan(
                          text: "privacy policy.",
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge!
                              .copyWith(
                                  color: AppColors.primaryColor,
                                  fontWeight: FontWeight.bold,
                                  decoration: TextDecoration.underline),
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
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                          "Can't open privacy policy right now. Copied website address to the clipboard."),
                                    ),
                                  );
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
                    final updated =
                        context.read<AuthCubit>().state.recipient?.copyWith(
                              termsAccepted: true,
                            );

                    if (updated != null) {
                      context.read<AuthCubit>().updateRecipient(updated);
                    }
                  },
                  label: "Create account",
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
