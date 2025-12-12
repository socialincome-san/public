# si_api_client.api.V1Api

## Load the API package

```dart
import 'package:si_api_client/api.dart';
```

All URIs are relative to _http://localhost:3001/api_

| Method                                                                                            | HTTP request                                          | Description                   |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------- |
| [**getV1RecipientsMe**](V1Api.md#getv1recipientsme)                                               | **GET** /v1/recipients/me                             | Get recipient                 |
| [**getV1RecipientsMePayouts**](V1Api.md#getv1recipientsmepayouts)                                 | **GET** /v1/recipients/me/payouts                     | List payouts                  |
| [**getV1RecipientsMePayoutspayoutId**](V1Api.md#getv1recipientsmepayoutspayoutid)                 | **GET** /v1/recipients/me/payouts/{payoutId}          | Get payout by ID              |
| [**getV1RecipientsMeSurveys**](V1Api.md#getv1recipientsmesurveys)                                 | **GET** /v1/recipients/me/surveys                     | Get surveys                   |
| [**patchV1RecipientsMe**](V1Api.md#patchv1recipientsme)                                           | **PATCH** /v1/recipients/me                           | Update recipient              |
| [**postV1AuthVerifyOtp**](V1Api.md#postv1authverifyotp)                                           | **POST** /v1/auth/verify-otp                          | Verify OTP                    |
| [**postV1ExchangeRate**](V1Api.md#postv1exchangerate)                                             | **POST** /v1/exchange-rate                            | Import exchange rates         |
| [**postV1PaymentFilesImport**](V1Api.md#postv1paymentfilesimport)                                 | **POST** /v1/payment-files-import                     | Import payment files          |
| [**postV1RecipientsMePayoutspayoutIdConfirm**](V1Api.md#postv1recipientsmepayoutspayoutidconfirm) | **POST** /v1/recipients/me/payouts/{payoutId}/confirm | Confirm payout                |
| [**postV1RecipientsMePayoutspayoutIdContest**](V1Api.md#postv1recipientsmepayoutspayoutidcontest) | **POST** /v1/recipients/me/payouts/{payoutId}/contest | Contest payout                |
| [**postV1StripeWebhook**](V1Api.md#postv1stripewebhook)                                           | **POST** /v1/stripe/webhook                           | Process Stripe webhook events |

# **getV1RecipientsMe**

> Recipient getV1RecipientsMe()

Get recipient

Returns the authenticated recipient with all related data.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();

try {
    final result = api_instance.getV1RecipientsMe();
    print(result);
} catch (e) {
    print('Exception when calling V1Api->getV1RecipientsMe: $e\n');
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Recipient**](Recipient.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **getV1RecipientsMePayouts**

> Payout getV1RecipientsMePayouts()

List payouts

Returns all payouts belonging to the authenticated recipient.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();

try {
    final result = api_instance.getV1RecipientsMePayouts();
    print(result);
} catch (e) {
    print('Exception when calling V1Api->getV1RecipientsMePayouts: $e\n');
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Payout**](Payout.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **getV1RecipientsMePayoutspayoutId**

> Payout getV1RecipientsMePayoutspayoutId(payoutId)

Get payout by ID

Returns a specific payout belonging to the authenticated recipient.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();
final payoutId = 123; // String | Payout ID

try {
    final result = api_instance.getV1RecipientsMePayoutspayoutId(payoutId);
    print(result);
} catch (e) {
    print('Exception when calling V1Api->getV1RecipientsMePayoutspayoutId: $e\n');
}
```

### Parameters

| Name         | Type       | Description | Notes |
| ------------ | ---------- | ----------- | ----- |
| **payoutId** | **String** | Payout ID   |

### Return type

[**Payout**](Payout.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **getV1RecipientsMeSurveys**

> Survey getV1RecipientsMeSurveys()

Get surveys

Returns all surveys belonging to the authenticated recipient.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();

try {
    final result = api_instance.getV1RecipientsMeSurveys();
    print(result);
} catch (e) {
    print('Exception when calling V1Api->getV1RecipientsMeSurveys: $e\n');
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Survey**](Survey.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **patchV1RecipientsMe**

> Recipient patchV1RecipientsMe(recipientSelfUpdate)

Update recipient

Updates the authenticated recipient’s personal information, contact
details, and mobile money payment information.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();
final recipientSelfUpdate = RecipientSelfUpdate(); // RecipientSelfUpdate |

try {
    final result = api_instance.patchV1RecipientsMe(recipientSelfUpdate);
    print(result);
} catch (e) {
    print('Exception when calling V1Api->patchV1RecipientsMe: $e\n');
}
```

### Parameters

| Name                    | Type                                              | Description | Notes      |
| ----------------------- | ------------------------------------------------- | ----------- | ---------- |
| **recipientSelfUpdate** | [**RecipientSelfUpdate**](RecipientSelfUpdate.md) |             | [optional] |

### Return type

[**Recipient**](Recipient.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **postV1AuthVerifyOtp**

> VerifyOtpResponse postV1AuthVerifyOtp(verifyOtpRequest)

Verify OTP

Verifies an OTP sent via Twilio and returns a Firebase custom token for
authentication.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();
final verifyOtpRequest = VerifyOtpRequest(); // VerifyOtpRequest |

try {
    final result = api_instance.postV1AuthVerifyOtp(verifyOtpRequest);
    print(result);
} catch (e) {
    print('Exception when calling V1Api->postV1AuthVerifyOtp: $e\n');
}
```

### Parameters

| Name                 | Type                                        | Description | Notes      |
| -------------------- | ------------------------------------------- | ----------- | ---------- |
| **verifyOtpRequest** | [**VerifyOtpRequest**](VerifyOtpRequest.md) |             | [optional] |

### Return type

[**VerifyOtpResponse**](VerifyOtpResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **postV1ExchangeRate**

> ExchangeRatesImportSuccess postV1ExchangeRate()

Import exchange rates

Imports exchange rates from external API into the database.

### Example

```dart
import 'package:si_api_client/api.dart';
// TODO Configure API key authorization: ApiKeyAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('ApiKeyAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('ApiKeyAuth').apiKeyPrefix = 'Bearer';

final api_instance = V1Api();

try {
    final result = api_instance.postV1ExchangeRate();
    print(result);
} catch (e) {
    print('Exception when calling V1Api->postV1ExchangeRate: $e\n');
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ExchangeRatesImportSuccess**](ExchangeRatesImportSuccess.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **postV1PaymentFilesImport**

> PaymentFilesImportResult postV1PaymentFilesImport()

Import payment files

Imports payment files from post finance.

### Example

```dart
import 'package:si_api_client/api.dart';
// TODO Configure API key authorization: ApiKeyAuth
//defaultApiClient.getAuthentication<ApiKeyAuth>('ApiKeyAuth').apiKey = 'YOUR_API_KEY';
// uncomment below to setup prefix (e.g. Bearer) for API key, if needed
//defaultApiClient.getAuthentication<ApiKeyAuth>('ApiKeyAuth').apiKeyPrefix = 'Bearer';

final api_instance = V1Api();

try {
    final result = api_instance.postV1PaymentFilesImport();
    print(result);
} catch (e) {
    print('Exception when calling V1Api->postV1PaymentFilesImport: $e\n');
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**PaymentFilesImportResult**](PaymentFilesImportResult.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **postV1RecipientsMePayoutspayoutIdConfirm**

> Payout postV1RecipientsMePayoutspayoutIdConfirm(payoutId)

Confirm payout

Marks a specific payout as confirmed by the authenticated recipient.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();
final payoutId = 123; // String | Payout ID

try {
    final result = api_instance.postV1RecipientsMePayoutspayoutIdConfirm(payoutId);
    print(result);
} catch (e) {
    print('Exception when calling V1Api->postV1RecipientsMePayoutspayoutIdConfirm: $e\n');
}
```

### Parameters

| Name         | Type       | Description | Notes |
| ------------ | ---------- | ----------- | ----- |
| **payoutId** | **String** | Payout ID   |

### Return type

[**Payout**](Payout.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **postV1RecipientsMePayoutspayoutIdContest**

> Payout postV1RecipientsMePayoutspayoutIdContest(payoutId)

Contest payout

Marks a specific payout as contested by the authenticated recipient.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();
final payoutId = 123; // String | Payout ID

try {
    final result = api_instance.postV1RecipientsMePayoutspayoutIdContest(payoutId);
    print(result);
} catch (e) {
    print('Exception when calling V1Api->postV1RecipientsMePayoutspayoutIdContest: $e\n');
}
```

### Parameters

| Name         | Type       | Description | Notes |
| ------------ | ---------- | ----------- | ----- |
| **payoutId** | **String** | Payout ID   |

### Return type

[**Payout**](Payout.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

# **postV1StripeWebhook**

> StripeWebhookResponse postV1StripeWebhook()

Process Stripe webhook events

Handles multiple Stripe webhook events including charge.succeeded,
charge.updated, and charge.failed to create/update contributions and
contributors.

### Example

```dart
import 'package:si_api_client/api.dart';

final api_instance = V1Api();

try {
    final result = api_instance.postV1StripeWebhook();
    print(result);
} catch (e) {
    print('Exception when calling V1Api->postV1StripeWebhook: $e\n');
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**StripeWebhookResponse**](StripeWebhookResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#)
[[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)
