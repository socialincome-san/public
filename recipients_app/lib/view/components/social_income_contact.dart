import "package:app/models/alert_visibility.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:provider/provider.dart";
import "package:url_launcher/url_launcher_string.dart";

class SocialIncomeContact extends StatelessWidget {
  const SocialIncomeContact({super.key});

  Future<void> openPhone(String number) async {}
  Future<void> openEmail(String address) async {}

  @override
  Widget build(BuildContext context) {
    Future<void> openWhatsapp(number) async {
      final whatsappURL = "whatsapp://send?phone=$number&text=hello";
      if (await canLaunchUrlString(whatsappURL)) {
        await launchUrlString(whatsappURL);
      } else {
        // ignore: use_build_context_synchronously
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("whatsapp no installed")),
        );
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

    return Consumer<AlertVisibility>(
      builder: (context, alertVisibility, child) {
        return Center(
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.backgroundColor,
              border: Border.all(
                color: Theme.of(context).primaryColor,
              ),
            ),
            height: MediaQuery.of(context).size.height * 0.75,
            width: MediaQuery.of(context).size.width * 0.9,
            child: Padding(
              padding: AppSpacings.a16,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Column(
                    children: [
                      Image(
                        image: const AssetImage("assets/team.png"),
                        width: MediaQuery.of(context).size.width * 0.6,
                      ),
                      const Text(
                        "Support Team",
                        style: TextStyle(fontSize: 24),
                      ),
                      const Text(
                        "Get in touch with us",
                        style: TextStyle(fontSize: 15, color: Colors.grey),
                      )
                    ],
                  ),
                  _IconAndContact("Whatsapp", "+41 76 251 55 69", openWhatsapp),
                  _IconAndContact("Phone", "+232 75 588647", makePhoneCall),
                  _IconAndContact(
                    "Email",
                    "support@socialincome.org",
                    writeEmail,
                  ),
                  ElevatedButton(
                    onPressed: () {
                      alertVisibility.setContactVisibility(false);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).primaryColor,
                      minimumSize: const Size(200, 60),
                    ),
                    child: const Text("Close"),
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _IconAndContact extends StatelessWidget {
  final String contactMethod;
  final String contactDetails;
  final Function(String) open;

  const _IconAndContact(this.contactMethod, this.contactDetails, this.open);

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
                onPressed: () => open(contactDetails.trim()),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contactMethod,
                      style: const TextStyle(fontSize: 18, color: Colors.black),
                    ),
                    Text(
                      contactDetails,
                      style: const TextStyle(fontSize: 15, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ],
          ),
        )
      ],
    );
  }
}
