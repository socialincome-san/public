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

// TODO: check if expected data types are coming back
  void initialize(Map<String, dynamic> data, String transactionId) {
    id = transactionId;
    amount = data["amount"] != null ? data["amount"] as int : null;
    confirmedAt =
        data["confirm_at"] != null ? data["confirm_at"] as Timestamp : null;
    contestedAt =
        data["contest_at"] != null ? data["contest_at"] as Timestamp : null;
    status = data["status"] != null ? data["status"] as String : null;
    contestReason = data["contest_reason"] != null
        ? data["contest_reason"] as String
        : null;
    currency = data["currency"] != null ? data["currency"] as String : null;
  }

  Map<String, dynamic> data() => {
        "amount": amount,
        "confirm_at": confirmedAt,
        "contest_at": contestedAt,
        "status": status,
        "contest_reason": contestReason,
        "currency": currency
      };
}
