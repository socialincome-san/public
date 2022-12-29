import "package:cloud_firestore/cloud_firestore.dart";

class SocialIncomeTransaction {
  String? id;
  int? amount;
  Timestamp? confirmedAt;
  Timestamp? contestedAt;
  String? status;
  String? contestReason;
  String? contestExplanation;
  String? currency;

  void initialize(Map<String, dynamic> data, String transactionId) {
    id = transactionId;
    amount = data["amount"];
    confirmedAt = data["confirm_at"];
    contestedAt = data["contest_at"];
    status = data["status"];
    contestReason = data["contest_reason"];
    currency = data['currency'];
  }

  Map<String, dynamic> data() => {
        'amount': amount,
        'confirm_at': confirmedAt,
        'contest_at': contestedAt,
        'status': status,
        'contest_reason': contestReason,
        'currency': currency
      };
}
