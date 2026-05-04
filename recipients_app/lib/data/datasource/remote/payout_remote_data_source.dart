import "dart:convert";

import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/services/authenticated_client.dart";

class PayoutRemoteDataSource implements PayoutDataSource {
  final AuthenticatedClient authenticatedClient;

  const PayoutRemoteDataSource({
    required this.authenticatedClient,
  });

  @override
  Future<Payout> confirmPayout({required String payoutId}) async {
    final uri = authenticatedClient.resolveUri("recipients/me/payouts/$payoutId/confirm");

    final response = await authenticatedClient.post(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to confirm payout: ${response.statusCode} - ${response.body}");
    }

    return PayoutMapper.fromJson(response.body);
  }

  @override
  Future<Payout> contestPayout({
    required String payoutId,
    required String? contestReason,
  }) async {
    final uri = authenticatedClient.resolveUri("recipients/me/payouts/$payoutId/contest");
    final body = {"comments": contestReason ?? ""};

    final response = await authenticatedClient.post(uri, body: jsonEncode(body));

    if (response.statusCode != 200) {
      throw Exception("Failed to contest payout: ${response.statusCode} - ${response.body}");
    }

    return PayoutMapper.fromJson(response.body);
  }

  @override
  Future<List<Payout>> fetchPayouts() async {
    final uri = authenticatedClient.resolveUri("recipients/me/payouts");

    final response = await authenticatedClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch payouts: ${response.statusCode} - ${response.body}");
    }

    final responseBody = jsonDecode(response.body) as List<dynamic>;
    final payouts = responseBody.map((e) => PayoutMapper.fromMap(e as Map<String, dynamic>)).toList();

    return payouts;
  }
}
