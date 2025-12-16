import "dart:convert";

import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/services/authenticated_client.dart";

class PayoutRemoteDataSource implements PayoutDataSource {
  final Uri baseUri;
  final AuthenticatedClient authenticatedClient;

  const PayoutRemoteDataSource({
    required this.baseUri,
    required this.authenticatedClient,
  });

  /// curl http://localhost:3001/api/v1/recipients/me/payouts/123/confirm \
  /// --request POST \
  @override
  Future<Payout> confirmPayout({required String payoutId}) async {
    final uri = baseUri.resolve("api/v1/recipients/me/payouts/$payoutId/confirm");

    final response = await authenticatedClient.post(uri);

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
    final uri = baseUri.resolve("api/v1/recipients/me/payouts/$payoutId/contest");
    final response = await authenticatedClient.post(uri);

    if (response.statusCode != 201) {
      throw Exception("Failed to contest payout: ${response.statusCode}");
    }

    return PayoutMapper.fromJson(response.body);
  }

  /// curl http://localhost:3001/api/v1/recipients/me/payouts
  @override
  Future<List<Payout>> fetchPayouts() async {
    final uri = baseUri.resolve("api/v1/recipients/me/payouts");

    final response = await authenticatedClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch payouts: ${response.statusCode}");
    }

    final responseBody = jsonDecode(response.body) as List<dynamic>;
    final payouts = responseBody.map((e) => PayoutMapper.fromJson(e.toString())).toList();

    return payouts;
  }
}
