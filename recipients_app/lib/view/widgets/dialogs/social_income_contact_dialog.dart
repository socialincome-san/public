import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:url_launcher/url_launcher_string.dart";

class SocialIncomeContactDialog extends StatelessWidget {
  const SocialIncomeContactDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      widthFactor: 0.9,
      heightFactor: 0.8,
      child: Center(
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
            color: AppColors.backgroundColor,
          ),
          child: Padding(
            padding: AppSpacings.a16,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Column(
                  children: [
                    Image(
                      image: const AssetImage("assets/team.png"),
                      width: MediaQuery.sizeOf(context).width * 0.6,
                    ),
                    Text(
                      context.l10n.supportTeam,
                      style: Theme.of(context).textTheme.headlineLarge,
                    ),
                    Text(
                      context.l10n.getInTouch,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
                Column(
                  children: [
                    _IconAndContact(
                      contactMethod: "WhatsApp",
                      contactDetails: "+232 75 588647",
                      onOpen: (String value) => openWhatsapp(context, value),
                    ),
                    const SizedBox(height: 16),
                    _IconAndContact(
                      contactMethod: context.l10n.phone,
                      contactDetails: "+232 75 588647",
                      onOpen: (String value) => makePhoneCall(value),
                    ),
                    const SizedBox(height: 16),
                    _IconAndContact(
                      contactMethod: context.l10n.email,
                      contactDetails: "hello@socialincome.org",
                      onOpen: (String value) => writeEmail(value),
                    ),
                  ],
                ),
                ButtonBig(
                  onPressed: () => Navigator.of(context).pop(),
                  label: context.l10n.close,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> openWhatsapp(BuildContext context, String number) async {
    final whatsappURL = "whatsapp://send?phone=$number&text=hello";
    if (await canLaunchUrlString(whatsappURL)) {
      await launchUrlString(whatsappURL);
    } else {
      if (context.mounted) {
        FlushbarHelper.showFlushbar(
          context,
          message: context.l10n.whatsappError,
          type: FlushbarType.error,
        );
      }
    }
  }

  Future<void> makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: "tel",
      path: phoneNumber,
    );
    await launchUrlString(launchUri.toString());
  }

  Future<void> writeEmail(String emailAdress) async {
    final Uri launchUri = Uri(
      scheme: "mailto",
      path: emailAdress,
    );
    await launchUrlString(launchUri.toString());
  }
}

class _IconAndContact extends StatelessWidget {
  final String contactMethod;
  final String contactDetails;
  final Function(String) onOpen;

  const _IconAndContact({
    required this.contactMethod,
    required this.contactDetails,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Padding(
          padding: AppSpacings.h8,
          child: Icon(
            Icons.check_circle_rounded,
            color: Theme.of(context).primaryColor,
            size: 30,
          ),
        ),
        Padding(
          padding: AppSpacings.h8,
          child: Column(
            children: [
              TextButton(
                onPressed: () => onOpen(contactDetails.trim()),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contactMethod,
                      style: const TextStyle(
                        fontSize: 18,
                        color: Colors.black,
                      ),
                    ),
                    Text(
                      contactDetails,
                      style: const TextStyle(
                        fontSize: 15,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
