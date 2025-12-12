//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;


class V1Api {
  V1Api([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Get recipient
  ///
  /// Returns the authenticated recipient with all related data.
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getV1RecipientsMeWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/v1/recipients/me';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get recipient
  ///
  /// Returns the authenticated recipient with all related data.
  Future<Recipient?> getV1RecipientsMe() async {
    final response = await getV1RecipientsMeWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'Recipient',) as Recipient;
    
    }
    return null;
  }

  /// List payouts
  ///
  /// Returns all payouts belonging to the authenticated recipient.
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getV1RecipientsMePayoutsWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/v1/recipients/me/payouts';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// List payouts
  ///
  /// Returns all payouts belonging to the authenticated recipient.
  Future<Payout?> getV1RecipientsMePayouts() async {
    final response = await getV1RecipientsMePayoutsWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'Payout',) as Payout;
    
    }
    return null;
  }

  /// Get payout by ID
  ///
  /// Returns a specific payout belonging to the authenticated recipient.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] payoutId (required):
  ///   Payout ID
  Future<Response> getV1RecipientsMePayoutspayoutIdWithHttpInfo(String payoutId,) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/recipients/me/payouts/{payoutId}'
      .replaceAll('{payoutId}', payoutId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get payout by ID
  ///
  /// Returns a specific payout belonging to the authenticated recipient.
  ///
  /// Parameters:
  ///
  /// * [String] payoutId (required):
  ///   Payout ID
  Future<Payout?> getV1RecipientsMePayoutspayoutId(String payoutId,) async {
    final response = await getV1RecipientsMePayoutspayoutIdWithHttpInfo(payoutId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'Payout',) as Payout;
    
    }
    return null;
  }

  /// Get surveys
  ///
  /// Returns all surveys belonging to the authenticated recipient.
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getV1RecipientsMeSurveysWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/v1/recipients/me/surveys';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get surveys
  ///
  /// Returns all surveys belonging to the authenticated recipient.
  Future<Survey?> getV1RecipientsMeSurveys() async {
    final response = await getV1RecipientsMeSurveysWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'Survey',) as Survey;
    
    }
    return null;
  }

  /// Update recipient
  ///
  /// Updates the authenticated recipient’s personal information, contact details, and mobile money payment information.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [RecipientSelfUpdate] recipientSelfUpdate:
  Future<Response> patchV1RecipientsMeWithHttpInfo({ RecipientSelfUpdate? recipientSelfUpdate, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/recipients/me';

    // ignore: prefer_final_locals
    Object? postBody = recipientSelfUpdate;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Update recipient
  ///
  /// Updates the authenticated recipient’s personal information, contact details, and mobile money payment information.
  ///
  /// Parameters:
  ///
  /// * [RecipientSelfUpdate] recipientSelfUpdate:
  Future<Recipient?> patchV1RecipientsMe({ RecipientSelfUpdate? recipientSelfUpdate, }) async {
    final response = await patchV1RecipientsMeWithHttpInfo( recipientSelfUpdate: recipientSelfUpdate, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'Recipient',) as Recipient;
    
    }
    return null;
  }

  /// Verify OTP
  ///
  /// Verifies an OTP sent via Twilio and returns a Firebase custom token for authentication.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [VerifyOtpRequest] verifyOtpRequest:
  Future<Response> postV1AuthVerifyOtpWithHttpInfo({ VerifyOtpRequest? verifyOtpRequest, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/verify-otp';

    // ignore: prefer_final_locals
    Object? postBody = verifyOtpRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Verify OTP
  ///
  /// Verifies an OTP sent via Twilio and returns a Firebase custom token for authentication.
  ///
  /// Parameters:
  ///
  /// * [VerifyOtpRequest] verifyOtpRequest:
  Future<VerifyOtpResponse?> postV1AuthVerifyOtp({ VerifyOtpRequest? verifyOtpRequest, }) async {
    final response = await postV1AuthVerifyOtpWithHttpInfo( verifyOtpRequest: verifyOtpRequest, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'VerifyOtpResponse',) as VerifyOtpResponse;
    
    }
    return null;
  }

  /// Import exchange rates
  ///
  /// Imports exchange rates from external API into the database.
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> postV1ExchangeRateWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/v1/exchange-rate';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Import exchange rates
  ///
  /// Imports exchange rates from external API into the database.
  Future<ExchangeRatesImportSuccess?> postV1ExchangeRate() async {
    final response = await postV1ExchangeRateWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ExchangeRatesImportSuccess',) as ExchangeRatesImportSuccess;
    
    }
    return null;
  }

  /// Import payment files
  ///
  /// Imports payment files from post finance.
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> postV1PaymentFilesImportWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/v1/payment-files-import';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Import payment files
  ///
  /// Imports payment files from post finance.
  Future<PaymentFilesImportResult?> postV1PaymentFilesImport() async {
    final response = await postV1PaymentFilesImportWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'PaymentFilesImportResult',) as PaymentFilesImportResult;
    
    }
    return null;
  }

  /// Confirm payout
  ///
  /// Marks a specific payout as confirmed by the authenticated recipient.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] payoutId (required):
  ///   Payout ID
  Future<Response> postV1RecipientsMePayoutspayoutIdConfirmWithHttpInfo(String payoutId,) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/recipients/me/payouts/{payoutId}/confirm'
      .replaceAll('{payoutId}', payoutId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Confirm payout
  ///
  /// Marks a specific payout as confirmed by the authenticated recipient.
  ///
  /// Parameters:
  ///
  /// * [String] payoutId (required):
  ///   Payout ID
  Future<Payout?> postV1RecipientsMePayoutspayoutIdConfirm(String payoutId,) async {
    final response = await postV1RecipientsMePayoutspayoutIdConfirmWithHttpInfo(payoutId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'Payout',) as Payout;
    
    }
    return null;
  }

  /// Contest payout
  ///
  /// Marks a specific payout as contested by the authenticated recipient.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] payoutId (required):
  ///   Payout ID
  Future<Response> postV1RecipientsMePayoutspayoutIdContestWithHttpInfo(String payoutId,) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/recipients/me/payouts/{payoutId}/contest'
      .replaceAll('{payoutId}', payoutId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Contest payout
  ///
  /// Marks a specific payout as contested by the authenticated recipient.
  ///
  /// Parameters:
  ///
  /// * [String] payoutId (required):
  ///   Payout ID
  Future<Payout?> postV1RecipientsMePayoutspayoutIdContest(String payoutId,) async {
    final response = await postV1RecipientsMePayoutspayoutIdContestWithHttpInfo(payoutId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'Payout',) as Payout;
    
    }
    return null;
  }

  /// Process Stripe webhook events
  ///
  /// Handles multiple Stripe webhook events including charge.succeeded, charge.updated, and charge.failed to create/update contributions and contributors.
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> postV1StripeWebhookWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/v1/stripe/webhook';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Process Stripe webhook events
  ///
  /// Handles multiple Stripe webhook events including charge.succeeded, charge.updated, and charge.failed to create/update contributions and contributors.
  Future<StripeWebhookResponse?> postV1StripeWebhook() async {
    final response = await postV1StripeWebhookWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'StripeWebhookResponse',) as StripeWebhookResponse;
    
    }
    return null;
  }
}
