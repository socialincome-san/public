import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/enums/gender.dart";
import "package:app/data/enums/recipient_status.dart";
import "package:app/data/models/contact.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/language_code.dart";
import "package:app/data/models/local_partner.dart";
import "package:app/data/models/phone.dart";
import "package:app/data/models/program.dart";
import "package:app/data/models/recipient.dart";
import "package:firebase_auth/firebase_auth.dart" as firebase_auth;

class UserDemoDataSource implements UserDataSource {
  Recipient? _recipient = Recipient(
    contactId: "demo",
    termsAccepted: true,
    programId: "demo",
    localPartnerId: "demo",
    contact: Contact(
      id: "demo",
      firstName: "Demo",
      lastName: "SocialIncome",
      email: "demo@socialincome.com",
      phoneId: "demo",
      phone: Phone(
        id: "demo",
        number: "23271118897",
        hasWhatsApp: true,
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      ),
      gender: Gender.male,
      language: LanguageCode.en,
      dateOfBirth: DateTime.now().toIso8601String(),
      profession: "Demo",
      isInstitution: false,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    ),
    id: "demo",
    localPartner: LocalPartner(
      id: "demo",
      name: "Demo",
      contact: Contact(
        id: "demo",
        firstName: "Demo",
        lastName: "SocialIncome",
        email: "demo@socialincome.com",
        phoneId: "demo",
        phone: Phone(
          id: "demo",
          number: "23271118897",
          hasWhatsApp: true,
          createdAt: DateTime.now().toIso8601String(),
          updatedAt: DateTime.now().toIso8601String(),
        ),
        gender: Gender.male,
        language: LanguageCode.en,
        dateOfBirth: DateTime.now().toIso8601String(),
        profession: "Demo",
        isInstitution: false,
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      ),
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    ),
    status: RecipientStatus.active,
    createdAt: DateTime.now().toIso8601String(),
    program: Program(
      ownerOrganizationId: "demo",
      createdAt: DateTime.now().toIso8601String(),
      id: "demo",
      name: "Demo",
      totalPayments: 0,
      payoutAmount: 0,
      payoutCurrency: Currency.usd,
      payoutInterval: 1,
      country: "US",
    ),
  );
  final _user = DemoUser();

  @override
  firebase_auth.User? get currentFirebaseUser {
    return _user;
  }

  @override
  Future<Recipient?> fetchRecipient(firebase_auth.User firebaseUser) async {
    return _recipient;
  }

  @override
  Future<Recipient> updateRecipient(Recipient recipient) async {
    _recipient = recipient;
    return recipient;
  }
}
