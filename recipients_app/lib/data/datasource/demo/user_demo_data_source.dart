import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/gender.dart";
import "package:app/data/models/language_code.dart";
import "package:app/data/models/local_partner.dart";
import "package:app/data/models/models.dart";
import "package:app/data/models/payout_interval.dart";
import "package:app/data/models/program.dart";
import "package:app/data/models/recipient_status.dart";
import "package:app/data/models/user.dart";
import "package:firebase_auth/firebase_auth.dart" as firebase_auth;

class UserDemoDataSource implements UserDataSource {
  Recipient? _recipient = Recipient(
    id: "demo",
    user: User(
      id: "demo",
      email: "demo@socialincome.com",
      authUserId: "demo",
      firstName: "Demo",
      lastName: "SocialIncome",
      gender: Gender.male,
      languageCode: LanguageCode.en,
      currency: Currency.usd,
      dateOfBirth: DateTime.now(),
      address: [],
      phoneNumber: [
        const PhoneNumber(
          id: "demo",
          phone: "23271118897",
          type: "mobileMoneyPhone",
          userId: "",
          isPrimary: false,
        ),
        const PhoneNumber(
          id: "demo",
          phone: "23271118897",
          type: "communicationMobilePhone",
          userId: "",
          isPrimary: true,
        ),
      ],
    ),
    localPartner: const LocalPartner(
      id: "demo",
      name: "Demo",
      user: User(
        id: "demo",
        email: "demo@socialincome.com",
        authUserId: "demo",
        firstName: "Demo",
        lastName: "SocialIncome",
        gender: Gender.male,
        address: [],
        phoneNumber: [],
      ),
    ),
    status: RecipientStatus.active,
    program: const Program(
      id: "demo",
      name: "Demo",
      totalPayments: 0,
      payoutAmount: 0,
      payoutCurrency: Currency.usd,
      payoutInterval: PayoutInterval.monthly,
      country: "US",
      viewerOrganizationId: "demo",
      operatorOrganizationId: "demo",
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
  Future<void> updateRecipient(Recipient recipient) async {
    _recipient = recipient;
  }
}
