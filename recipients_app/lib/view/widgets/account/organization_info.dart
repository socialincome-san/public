import "package:app/data/models/organization.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:url_launcher/url_launcher_string.dart";

class OrganizationInfo extends StatelessWidget {
  final Organization organization;

  const OrganizationInfo({super.key, required this.organization});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        Text(context.l10n.recommendingOrganization, style: Theme.of(context).textTheme.bodyLarge),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: AppSpacings.a12,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.lock, color: Colors.black),
                    const SizedBox(width: 8),
                    Text(
                      organization.name,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    if (organization.contactNumber != null)
                      ButtonSmall(
                        label: context.l10n.call,
                        buttonType: ButtonSmallType.outlined,
                        color: Colors.black,
                        onPressed: () => launchUrlString("tel:${organization.contactNumber}"),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                if (organization.contactName != null)
                  Text(organization.contactName!, style: Theme.of(context).textTheme.bodyMedium),
                if (organization.contactNumber != null)
                  Text(organization.contactNumber!, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
