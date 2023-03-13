import "dart:convert";

import "package:cloud_firestore/cloud_firestore.dart";
import "package:equatable/equatable.dart";

class SocialIncomePayment extends Equatable {
  final String id;
  final int? amount;
  final Timestamp? paymentAt;
  final String? currency;
  final PaymentStatus? status;
  final String? comments;

  const SocialIncomePayment({
    required this.id,
    this.amount,
    this.paymentAt,
    this.currency,
    this.status,
    this.comments,
  });

  @override
  List<Object?> get props {
    return [
      id,
      amount,
      paymentAt,
      currency,
      status,
      comments,
    ];
  }

  Map<String, dynamic> toMap() {
    final result = <String, dynamic>{};

    if (amount != null) {
      result.addAll({"amount": amount});
    }
    if (paymentAt != null) {
      result.addAll({"payment_at": paymentAt});
    }
    if (comments != null) {
      result.addAll({"comments": comments});
    }
    if (currency != null) {
      result.addAll({"currency": currency});
    }
    if (status != null) {
      result.addAll({"status": status?.name});
    }

    return result;
  }

  String toJson() => json.encode(toMap());

  factory SocialIncomePayment.fromMap(String id, Map<String, dynamic> map) {
    return SocialIncomePayment(
      id: id,
      amount: map["amount"] != null ? map["amount"] as int? : null,
      paymentAt:
          map["payment_at"] != null ? map["payment_at"] as Timestamp : null,
      comments: map["comments"] as String?,
      currency: map["currency"] as String?,
      status: map["status"] != null
          ? PaymentStatus.values
              .singleWhere((element) => element.name == map["status"])
          : null,
    );
  }

  // TODO: do we need this?
  // factory SocialIncomePayment.fromJson(String source) =>
  //     SocialIncomePayment.fromMap(
  //       jsonDecode(source) as Map<String, dynamic>,
  //     );

  SocialIncomePayment copyWith({
    String? id,
    int? amount,
    Timestamp? paymentAt,
    String? comments,
    String? currency,
    PaymentStatus? status,
  }) {
    return SocialIncomePayment(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      paymentAt: paymentAt ?? this.paymentAt,
      comments: comments ?? this.comments,
      currency: currency ?? this.currency,
      status: status ?? this.status,
    );
  }
}

enum PaymentStatus {
  created,
  paid,
  confirmed,
  contested,
  failed,
  other,
}
