import "package:app/data/models/local_partner.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:url_launcher/url_launcher_string.dart";

class LocalPartnerInfo extends StatelessWidget {
  final LocalPartner localPartner;

  const LocalPartnerInfo({
    super.key,
    required this.localPartner,
  });

  @override
  Widget build(BuildContext context) {
    // TODO(Verena): check if this is the correct phone number
    // final contactNumber = localPartner.user.phoneNumber.firstWhere((phoneNumber) => phoneNumber.isPrimary).phone;
    final contactNumber = localPartner.contact?.phone?.number ?? "";
    if (contactNumber.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.l10n.recommendingOrganization,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: AppSpacings.a12,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.lock,
                      color: Colors.black,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      localPartner.name,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    ButtonSmall(
                      label: context.l10n.call,
                      buttonType: ButtonSmallType.outlined,
                      color: Colors.black,
                      onPressed: () => launchUrlString(
                        "tel:$contactNumber",
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  localPartner.name,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                Text(
                  contactNumber,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
