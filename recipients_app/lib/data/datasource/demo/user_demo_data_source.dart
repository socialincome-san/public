import "dart:async";
import "dart:math";

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
  late Recipient recipient;

  UserDemoDataSource() {
    recipient = _initRecipient();
  }

  Recipient _initRecipient() {
    final payoutInterval = randomPayoutInterval(Random());
    var programDurationInMonths = 0;

    if (payoutInterval == PayoutInterval.monthly) {
      programDurationInMonths = Random().nextInt(55) + 6; // Random duration between 6 and 60 months
    }
    else if (payoutInterval == PayoutInterval.quarterly) {
      programDurationInMonths = (Random().nextInt(5) + 1) * 12; // Random duration between 1 and 5 years
    }
    else if (payoutInterval == PayoutInterval.yearly) {
      programDurationInMonths = (Random().nextInt(5) + 1) * 12; // Random duration between 1 and 5 years
    }

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
          number: "",
          hasWhatsApp: true,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
        gender: Gender.male,
        language: LanguageCode.en,
        dateOfBirth: DateTime.now().subtract(const Duration(days: 365 * 30)), // Assuming 30 years old
        profession: "Demo",
        isInstitution: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
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
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          ),
          gender: Gender.male,
          language: LanguageCode.en,
          dateOfBirth: DateTime.now(),
          profession: "Demo",
          isInstitution: false,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      createdAt: DateTime.now(),
      program: Program(
        id: "demo",
        name: "Demo",
        countryId: "SL",
        country: const Country(isoCode: "SL", currency: "SLE"),
        payoutPerInterval: Random().nextInt(190) + 10, // Random payout between 10 and 200
        payoutInterval: payoutInterval,
        programDurationInMonths: programDurationInMonths,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      paymentInformation: PaymentInformation(
        id: "demo",
        mobileMoneyProviderId: "demo",
        mobileMoneyProvider: const MobileMoneyProvider(id: "demo", name: "Demo Mobile Money Provider"),
        code: "7843754",
        phoneId: "demo",
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        phone: Phone(
          id: "demo",
          number: "23271118897",
          hasWhatsApp: false,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
      ),
    );
  }

  final _user = DemoUser();

  @override
  firebase_auth.User? get currentFirebaseUser {
    return _user;
  }

  @override
  Future<Recipient?> fetchRecipient(firebase_auth.User firebaseUser) async {
    return recipient;
  }

  @override
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    return recipient.copyWith(
      contact: recipient.contact.copyWith(
        firstName: selfUpdate.firstName,
        lastName: selfUpdate.lastName,
        dateOfBirth: selfUpdate.dateOfBirth,
        gender: selfUpdate.gender,
        language: selfUpdate.language,
      ),
      paymentInformation: recipient.paymentInformation?.copyWith(
        phone: Phone(
          id: "demo",
          number: selfUpdate.paymentPhone ?? "",
          hasWhatsApp: false,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
      ),
    );
  }
}

PayoutInterval randomPayoutInterval(Random random) {
  const values = PayoutInterval.values;
  return values[random.nextInt(values.length)];
}
