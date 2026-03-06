import "dart:async";

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
import "package:firebase_auth/firebase_auth.dart";

class UserDemoDataSource implements UserDataSource {
  late Recipient _recipient;

  UserDemoDataSource() {
    _recipient = _createDemoRecipient();
  }

  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    return _recipient;
  }

  @override
  Future<Recipient> updateRecipient(User firebaseUser, RecipientSelfUpdate selfUpdate) async {
    final updatedContact = _recipient.contact.copyWith(
      firstName: selfUpdate.firstName ?? _recipient.contact.firstName,
      lastName: selfUpdate.lastName ?? _recipient.contact.lastName,
      callingName: selfUpdate.callingName ?? _recipient.contact.callingName,
      gender: selfUpdate.gender ?? _recipient.contact.gender,
      dateOfBirth: selfUpdate.dateOfBirth ?? _recipient.contact.dateOfBirth,
      language: selfUpdate.language ?? _recipient.contact.language,
      email: selfUpdate.email ?? _recipient.contact.email,
      phone: selfUpdate.contactPhone != null
          ? _recipient.contact.phone?.copyWith(number: selfUpdate.contactPhone)
          : _recipient.contact.phone,
    );

    final updatedPaymentInformation = _recipient.paymentInformation?.copyWith(
      mobileMoneyProvider: selfUpdate.mobileMoneyProvider ?? _recipient.paymentInformation!.mobileMoneyProvider,
      phone: selfUpdate.paymentPhone != null
          ? _recipient.paymentInformation!.phone.copyWith(number: selfUpdate.paymentPhone)
          : _recipient.paymentInformation!.phone,
    );

    final newRecipient = _recipient.copyWith(
      contact: updatedContact,
      successorName: selfUpdate.successorName ?? _recipient.successorName,
      termsAccepted: selfUpdate.termsAccepted ?? _recipient.termsAccepted,
      paymentInformation: updatedPaymentInformation ?? _recipient.paymentInformation,
    );

    _recipient = newRecipient;

    return newRecipient;
  }

  @override
  Recipient? get currentRecipient => _recipient;

  Recipient _createDemoRecipient() {
    return Recipient(
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
        country: const Country(isoCode: "SL"),
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
  }
}
