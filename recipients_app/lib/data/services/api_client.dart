import "package:app/data/models/api/request_otp_request.dart";
import "package:app/data/models/api/verify_otp_request.dart";
import "package:app/data/models/api/verify_otp_response.dart";
import "package:http/http.dart" as http;

class ApiClient {
  final http.Client httpClient;
  final Uri baseUri;

  const ApiClient({
    required this.httpClient,
    required this.baseUri,
  });

  /*
  REQUEST
  curl http://localhost:3001/api/v1/auth/verify-otp \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "phoneNumber": "",
  "otp": ""
  }'
  RESPONSE:
  {
    "customToken": "string",
    "isNewUser": true,
    "uid": "string"
  }
  */
  Future<VerifyOtpResponse> verifyOtp(String phoneNumber, String otp) async {
    final uri = baseUri.resolve("api/v1/auth/verify-otp");

    final body = VerifyOtpRequest(
      phoneNumber: phoneNumber,
      otp: otp,
    );

    final response = await httpClient.post(
      uri,
      body: body.toJson(),
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to verify OTP: ${response.statusCode} - ${response.reasonPhrase}");
    }

    return VerifyOtpResponseMapper.fromJson(response.body);
  }

  Future<VerifyOtpResponse> requestOtp(String phoneNumber) async {
    final uri = baseUri.resolve("api/v1/auth/request-otp");

    final body = RequestOtpRequest(
      phoneNumber: phoneNumber,
    );

    final response = await httpClient.post(
      uri,
      body: body.toJson(),
    );

    if (response.statusCode != 204) {
      throw Exception("Failed to request OTP: ${response.statusCode} - ${response.reasonPhrase}");
    }

    return VerifyOtpResponseMapper.fromJson(response.body);
  }
}
