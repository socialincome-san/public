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
  late final TapGestureRecognizer _privacyPolicyRecognizer;

  @override
  void initState() {
    super.initState();
    _successorNameController = TextEditingController(
      text: context.read<AuthCubit>().state.recipient?.successorName ?? "",
    );
    _privacyPolicyRecognizer = TapGestureRecognizer()..onTap = _openPrivacyPolicy;
  }

  @override
  void dispose() {
    _successorNameController.dispose();
    _privacyPolicyRecognizer.dispose();
    super.dispose();
  }

  Future<void> _openPrivacyPolicy() async {
    const url = "https://socialincome.org/privacy";
    if (await canLaunchUrlString(url)) {
      await launchUrlString(url);
    } else {
      await Clipboard.setData(const ClipboardData(text: url));
      if (mounted) {
        FlushbarHelper.showFlushbar(
          context,
          message: context.l10n.privacyPolicyError,
          type: FlushbarType.error,
        );
      }
    }
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
          title: Text(context.l10n.onboarding),
          leading: BackButton(
            onPressed: () {
              context.read<AuthCubit>().logout();
            },
          ),
          centerTitle: true,
        ),
        body: Padding(
          padding: AppSpacings.a16,
          // The footer lives inside the scroll view so it can scroll away when
          // the keyboard shrinks the viewport, instead of overflowing.
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      context.l10n.onboardingText,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 32),
                    Text(
                      context.l10n.inCaseOfDeathTitle,
                      style: Theme.of(context).textTheme.headlineMedium,
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
                    const SizedBox(height: 64),
                  ],
                ),
              ),
              SliverFillRemaining(
                hasScrollBody: false,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
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
                            recognizer: _privacyPolicyRecognizer,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
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
            ],
          ),
        ),
      ),
    );
  }
}
