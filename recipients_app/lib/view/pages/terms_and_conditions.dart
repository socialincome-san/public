import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:url_launcher/url_launcher_string.dart";

// TODO reenable terms and condition page on signin
class TermsAndConditions extends StatelessWidget {
  const TermsAndConditions({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppSpacings.a16,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const SizedBox(height: 16),
          const Text(
            "Welcome to Social Income",
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w400),
          ),
          const SizedBox(height: 16),
          const Text(
            "To give you the best experience, we use data from your device to",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          const Column(
            children: [
              _IconAndText(
                "Make the app work and provide our services",
                Icons.remember_me,
              ),
              _IconAndText(
                "Improve service performance by use of analytics",
                Icons.poll,
              ),
              _IconAndText("Read our privacy policy", Icons.policy),
            ],
          ),
          const Spacer(),
          ButtonBig(
            onPressed: () {
              final updated =
                  context.read<AuthCubit>().state.recipient!.copyWith(
                        termsAccepted: true,
                      );

              context.read<AuthCubit>().updateRecipient(updated);
            },
            label: "Accept",
          ),
        ],
      ),
    );
  }
}

class _IconAndText extends StatelessWidget {
  final IconData icon;
  final String text;
  const _IconAndText(this.text, this.icon);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 36, color: Colors.grey[700]),
        Flexible(
          child: Padding(
            padding: AppSpacings.a16,
            child: text == "Read our privacy policy"
                ? TextButton(
                    style: TextButton.styleFrom(padding: EdgeInsets.zero),
                    onPressed: () async {
                      const url = "https://socialincome.org/privacy";
                      if (await canLaunchUrlString(url)) {
                        await launchUrlString(url);
                      } else {
                        throw "Could not launch $url";
                      }
                    },
                    child: Text(
                      text,
                      style: const TextStyle(
                        decoration: TextDecoration.underline,
                        fontSize: 18,
                        color: Colors.black,
                        fontWeight: FontWeight.w500,
                        height: 1.4,
                      ),
                    ),
                  )
                : Text(
                    text,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                      height: 1.4,
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}
