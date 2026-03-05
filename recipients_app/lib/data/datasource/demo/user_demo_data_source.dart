import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/enums/gender.dart";
import "package:app/data/enums/payout_interval.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/contact.dart";
import "package:app/data/models/country.dart";
import "package:app/data/models/language_code.dart";
import "package:app/data/models/local_partner.dart";
import "package:app/data/models/mobile_money_provider.dart";
import "package:app/data/models/payment_information.dart";
import "package:app/data/models/phone.dart";
import "package:app/data/models/program.dart";
import "package:app/data/models/recipient.dart";
import "package:firebase_auth/firebase_auth.dart" as firebase_auth;

class UserDemoDataSource implements UserDataSource {
  final Recipient _recipient = Recipient(
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
    createdAt: DateTime.now().toIso8601String(),
    program: Program(
      // ownerOrganizationId: "demo",
      id: "demo",
      name: "Demo",
      countryId: "SL",
      country: const Country(isoCode:"SL"),
      payoutPerInterval: 50,
      payoutInterval: PayoutInterval.monthly,
      programDurationInMonths: 12,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    ),
    paymentInformation: PaymentInformation(
      id: "demo",
      mobileMoneyProviderId: "demo",
      mobileMoneyProvider: const MobileMoneyProvider(id: "demo", name: "Demo Mobile Money Provider"),
      code: "7843754",
      phoneId: "demo",
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
      phone: Phone(
        id: "demo",
        number: "23271118897",
        hasWhatsApp: false,
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      ),
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
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    _recipient.copyWith(
      contact: _recipient.contact.copyWith(
        firstName: selfUpdate.firstName,
        lastName: selfUpdate.lastName,
        callingName: selfUpdate.callingName,
        gender: selfUpdate.gender,
        dateOfBirth: selfUpdate.dateOfBirth,
        language: selfUpdate.language,
        email: selfUpdate.email,
        phone: selfUpdate.contactPhone != null ? Phone(
          id: "demo",
          number: selfUpdate.contactPhone!,
          hasWhatsApp: _recipient.contact.phone?.hasWhatsApp ?? false,
          createdAt: _recipient.contact.phone?.createdAt ?? DateTime.now().toIso8601String(),
          updatedAt: DateTime.now().toIso8601String(),
        ) : _recipient.contact.phone,
      ),
      paymentInformation: _recipient.paymentInformation?.copyWith(
        phone: selfUpdate.paymentPhone != null ? Phone(
          id: "demo",
          number: selfUpdate.paymentPhone!,
          hasWhatsApp: _recipient.paymentInformation?.phone.hasWhatsApp ?? false,
          createdAt: _recipient.paymentInformation?.phone.createdAt ?? DateTime.now().toIso8601String(),
          updatedAt: DateTime.now().toIso8601String(),
        ) : _recipient.paymentInformation?.phone,
        mobileMoneyProvider: selfUpdate.mobileMoneyProvider ?? _recipient.paymentInformation?.mobileMoneyProvider,
      ),
      successorName: selfUpdate.successorName,
      termsAccepted: selfUpdate.termsAccepted,
    );
    return _recipient;
  }

  @override
  Recipient? get currentRecipient => _recipient;
}
