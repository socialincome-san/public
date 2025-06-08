import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
import "package:app/data/datasource/demo/no_op_document_reference.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/models.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserDemoDataSource implements UserDataSource {
  Recipient? _recipient = const Recipient(
    userId: "demo",
    firstName: "Demo",
    lastName: "SocialIncome",
    mobileMoneyPhone: Phone(23271118897),
    communicationMobilePhone: Phone(23271118897),
    organizationRef: NoOpDocumentReference(),
  );
  final _user = DemoUser();

  @override
  User? get currentUser {
    return _user;
  }

  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    return _recipient;
  }

  @override
  Future<void> updateRecipient(Recipient recipient) async {
    _recipient = recipient;
  }
}
