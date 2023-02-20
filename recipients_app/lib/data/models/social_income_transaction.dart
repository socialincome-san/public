import "dart:convert";

import "package:cloud_firestore/cloud_firestore.dart";
import "package:equatable/equatable.dart";

class SocialIncomeTransaction extends Equatable {
  final String? id;
  final int? amount;
  final Timestamp? confirmAt;
  final Timestamp? contestAt;
  final String? contestReason;
  final String? contestExplanation;
  final String? currency;
  final String? status;

  const SocialIncomeTransaction({
    this.id,
    this.amount,
    this.confirmAt,
    this.contestAt,
    this.contestReason,
    this.contestExplanation,
    this.currency,
    this.status,
  });

// TODO: check if expected data types are coming back
/*   void initialize(Map<String, dynamic> data, String transactionId) {
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
  } */

/*   Map<String, dynamic> data() => {
        "amount": amount,
        "confirm_at": confirmedAt,
        "contest_at": contestedAt,
        "status": status,
        "contest_reason": contestReason,
        "currency": currency
      }; */

  @override
  List<Object?> get props {
    return [
      id,
      amount,
      confirmAt,
      contestAt,
      contestReason,
      contestExplanation,
      currency,
      status,
    ];
  }

  Map<String, dynamic> toMap() {
    final result = <String, dynamic>{};

    if (id != null) {
      result.addAll({"id": id});
    }
    if (amount != null) {
      result.addAll({"amount": amount});
    }
    if (confirmAt != null) {
      result.addAll({"confirm_at": confirmAt});
    }
    if (contestAt != null) {
      result.addAll({"contest_at": contestAt});
    }
    if (contestReason != null) {
      result.addAll({"contest_reason": contestReason});
    }
    if (contestExplanation != null) {
      result.addAll({"contest_explanation": contestExplanation});
    }
    if (currency != null) {
      result.addAll({"currency": currency});
    }
    if (status != null) {
      result.addAll({"status": status});
    }

    return result;
  }

  String toJson() => json.encode(toMap());
  factory SocialIncomeTransaction.fromMap(Map<String, dynamic> map) {
    return SocialIncomeTransaction(
      id: map["id"] as String?,
      amount: map["amount"] != null ? map["amount"] as int? : null,
      confirmAt:
          map["confirm_at"] != null ? map["confirm_at"] as Timestamp : null,
      contestAt:
          map["contest_at"] != null ? map["contest_at"] as Timestamp : null,
      contestReason: map["contest_reason"] as String?,
      contestExplanation: map["contest_explanation"] as String?,
      currency: map["currency"] as String?,
      status: map["status"] as String?,
    );
  }

  factory SocialIncomeTransaction.fromJson(String source) =>
      SocialIncomeTransaction.fromMap(
        jsonDecode(source) as Map<String, dynamic>,
      );

  SocialIncomeTransaction copyWith({
    String? id,
    int? amount,
    Timestamp? confirmAt,
    Timestamp? contestAt,
    String? contestReason,
    String? contestExplanation,
    String? currency,
    String? status,
  }) {
    return SocialIncomeTransaction(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      confirmAt: confirmAt ?? this.confirmAt,
      contestAt: contestAt ?? this.contestAt,
      contestReason: contestReason ?? this.contestReason,
      contestExplanation: contestExplanation ?? this.contestExplanation,
      currency: currency ?? this.currency,
      status: status ?? this.status,
    );
  }
}
