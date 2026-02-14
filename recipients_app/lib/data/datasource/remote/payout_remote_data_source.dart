import "dart:convert";

import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/services/authenticated_client.dart";
import "package:http/http.dart";

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
      throw Exception("Failed to confirm payout: ${response.statusCode}");
    }

    return PayoutMapper.fromJson(response.body);
  }

  /// TODO(migration): contest reason is not yet implemented in backend
  /// curl http://localhost:3001/api/v1/recipients/me/payouts/123/contest \
  /// --request POST
  @override
  Future<Payout> contestPayout({
    required String payoutId,
    required String? contestReason,
  }) async {
    final uri = authenticatedClient.resolveUri("recipients/me/payouts/$payoutId/contest");

    // if contest reason is not null, add it to the comment in payout
    Response? response;
    if (contestReason != null) {
      final body = {
        "comments": contestReason,
      };

      response = await authenticatedClient.post(uri, body: jsonEncode(body));
    } else {
      response = await authenticatedClient.post(uri);
    }

    if (response.statusCode != 200) {
      throw Exception("Failed to contest payout: ${response.statusCode}");
    }

    return PayoutMapper.fromJson(response.body);
  }

  @override
  Future<List<Payout>> fetchPayouts() async {
    final uri = authenticatedClient.resolveUri("recipients/me/payouts");

    final response = await authenticatedClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch payouts: ${response.statusCode}");
    }

    final responseBody = jsonDecode(response.body) as List<dynamic>;
    final payouts = responseBody.map((e) => PayoutMapper.fromMap(e as Map<String, dynamic>)).toList();

    return payouts;
  }
}
