import "dart:convert";

import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/models/payment/payout.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:http/http.dart" as http;

class PayoutRemoteDataSource implements PayoutDataSource {
  final String baseUrl;
  final http.Client httpClient;
  final FirebaseAuth firebaseAuth;

  const PayoutRemoteDataSource({
    required this.baseUrl,
    required this.httpClient,
    required this.firebaseAuth,
  });

  /// curl http://localhost:3001/api/v1/recipients/me/payouts/123/confirm \
  /// --request POST \
  @override
  Future<Payout> confirmPayout({required String payoutId}) async {
    final uri = Uri.parse("$baseUrl/api/v1/recipients/me/payouts/$payoutId/confirm");

    final response = await httpClient.post(uri);

    if (response.statusCode != 201) {
      throw Exception("Failed to confirm payout: ${response.statusCode}");
    }

    return PayoutMapper.fromJson(response.body);
  }

  /// TODO: contest reason is not yet implemented in backend
  /// curl http://localhost:3001/api/v1/recipients/me/payouts/123/contest \
  /// --request POST
  @override
  Future<Payout> contestPayout({
    required String payoutId,
    required String contestReason,
  }) async {
    final uri = Uri.parse("$baseUrl/api/v1/recipients/me/payouts/$payoutId/contest");

    final response = await httpClient.post(uri);

    if (response.statusCode != 201) {
      throw Exception("Failed to contest payout: ${response.statusCode}");
    }

    return PayoutMapper.fromJson(response.body);
  }

  /// curl http://localhost:3001/api/v1/recipients/me/payouts
  @override
  Future<List<Payout>> fetchPayouts() async {
    final uri = Uri.parse("$baseUrl/api/v1/recipients/me/payouts");

    final response = await httpClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch payouts: ${response.statusCode}");
    }

    final responseBody = jsonDecode(response.body) as List<dynamic>;
    final payouts = responseBody.map((e) => PayoutMapper.fromJson(e.toString())).toList();

    return payouts;
  }
}

/* const String paymentCollection = "payments";

class PaymentRemoteDataSource implements PaymentDataSource {
  final FirebaseFirestore firestore;

  const PaymentRemoteDataSource({
    required this.firestore,
  });

  @override
  Future<List<SocialIncomePayment>> fetchPayouts({
    required String recipientId,
  }) async {
    final List<SocialIncomePayment> payments = <SocialIncomePayment>[];

    final paymentsDocs = await firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .get();

    for (final paymentDoc in paymentsDocs.docs) {
      final payment = SocialIncomePaymentMapper.fromMap(
        paymentDoc.data(),
      );

      payments.add(payment.copyWith(id: paymentDoc.id));
    }

    payments.sort((a, b) => a.id.compareTo(b.id));

    return payments;
  }

  /// This updates the payment status to confirmed
  /// and also sets lastUpdatedAt and lastUpdatedBy to the
  /// current time and recipient
  @override
  Future<void> confirmPayout({
    required Recipient recipient,
    required SocialIncomePayment payment,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.confirmed,
      updatedBy: recipient.userId,
    );

    await firestore
        .collection(recipientCollection)
        .doc(recipient.userId)
        .collection(paymentCollection)
        .doc(payment.id)
        .update(updatedPayment.toMap());
  }

  @override
  Future<void> contestPayout({
    required Recipient recipient,
    required SocialIncomePayment payment,
    required String contestReason,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.contested,
      comments: contestReason,
      updatedBy: recipient.userId,
    );

    await firestore
        .collection(recipientCollection)
        .doc(recipient.userId)
        .collection(paymentCollection)
        .doc(payment.id)
        .update(updatedPayment.toMap());
  }
}
 */
