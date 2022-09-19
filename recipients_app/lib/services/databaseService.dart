import 'package:app/models/currentUser.dart';
import 'package:app/models/transaction.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class DatabaseService {
  final String phoneNumber;
  final FirebaseFirestore firestore = FirebaseFirestore.instance;

  DatabaseService(this.phoneNumber);

  Future<DocumentSnapshot> getUserSnapshot() async {
    var test = await firestore
        .collection('/recipients')
        .where('mobile_money_phone.phone',
            isEqualTo: int.parse(phoneNumber.substring(1)))
        .get();

    return test.docs.first;
  }

  Future<CurrentUser> fetchUserDetails(CurrentUser user) async {
    user.initialize(await getUserSnapshot());
    return user;
  }

  Future<bool> userExists() async {
    var snapshot = await getUserSnapshot();
    return snapshot.exists;
  }

  Future<void> updateOrCreateUser(CurrentUser user) async {
    var snapshot = await getUserSnapshot();
    snapshot.reference.set(user.data());
  }

  Future<List<SocialIncomeTransaction>> fetchTransactionDetails() async {
    List<SocialIncomeTransaction> transactions = <SocialIncomeTransaction>[];
    var snapshot = await getUserSnapshot();

    var transactionDocs = await firestore
        .collection('/recipients')
        .doc(snapshot.id)
        .collection('payments')
        .get();

    transactionDocs.docs.forEach((element) {
      var transaction = SocialIncomeTransaction();
      transaction.initialize(element.data(), element.id);
      transactions.add(transaction);
    });

    transactions.sort((a, b) {
      var aId = a.id;
      var bId = b.id;

      return aId != null && bId != null ? bId.compareTo(aId) : 0;
    });

    return transactions;
  }

  Future<void> updateUser(Map<String, Object?> info) async {
    var userSnapshot = await getUserSnapshot();
    return userSnapshot.reference.update(info);
  }

  void updateTransaction(Map<String, Object?> info, String transactionId) async {
    var snapshot = await getUserSnapshot();

    await firestore
        .collection('/recipients')
        .doc(snapshot.id)
        .collection('payments')
        .doc(transactionId)
        .update(info);
  }

  void updateNextSurvey(DateTime date) async {
    var snapshot = await getUserSnapshot();

    await firestore
        .collection('/recipients')
        .doc(snapshot.id)
        .update({'next_survey': date});
  }
}
