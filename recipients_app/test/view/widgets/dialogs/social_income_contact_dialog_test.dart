import "package:app/data/models/contact.dart";
import "package:app/data/models/local_partner.dart";
import "package:app/data/models/phone.dart";
import "package:app/l10n/arb/app_localizations.dart";
import "package:app/view/widgets/dialogs/social_income_contact_dialog.dart";
import "package:flutter/material.dart";
import "package:flutter_test/flutter_test.dart";

void main() {
  testWidgets("shows the recipient's local partner contact methods", (
    tester,
  ) async {
    final localPartner = LocalPartner(
      id: "local-partner-1",
      name: "Local Partner",
      contact: Contact(
        id: "contact-1",
        firstName: "Support",
        lastName: "Contact",
        phone: Phone(
          id: "phone-1",
          number: "+123456789",
          hasWhatsApp: true,
          createdAt: DateTime.utc(2026),
        ),
        isInstitution: true,
        createdAt: DateTime.utc(2026),
      ),
      createdAt: DateTime.utc(2026),
    );

    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(
          body: SocialIncomeContactDialog(localPartner: localPartner),
        ),
      ),
    );

    expect(find.text("Phone · Local Partner"), findsOneWidget);
    expect(find.text("WhatsApp · Local Partner"), findsOneWidget);
    expect(find.text("+123456789"), findsNWidgets(2));
    expect(tester.takeException(), isNull);
  });
}
