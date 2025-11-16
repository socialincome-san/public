//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

import 'package:si_api_client/api.dart';
import 'package:test/test.dart';


/// tests for V1Api
void main() {
  // final instance = V1Api();

  group('tests for V1Api', () {
    // Get recipient
    //
    // Returns the authenticated recipient with all related data.
    //
    //Future<Recipient> getV1RecipientsMe() async
    test('test getV1RecipientsMe', () async {
      // TODO
    });

    // List payouts
    //
    // Returns all payouts belonging to the authenticated recipient.
    //
    //Future<Payout> getV1RecipientsMePayouts() async
    test('test getV1RecipientsMePayouts', () async {
      // TODO
    });

    // Get payout by ID
    //
    // Returns a specific payout belonging to the authenticated recipient.
    //
    //Future<Payout> getV1RecipientsMePayoutspayoutId(String payoutId) async
    test('test getV1RecipientsMePayoutspayoutId', () async {
      // TODO
    });

    // Get surveys
    //
    // Returns all surveys belonging to the authenticated recipient.
    //
    //Future<Survey> getV1RecipientsMeSurveys() async
    test('test getV1RecipientsMeSurveys', () async {
      // TODO
    });

    // Update recipient
    //
    // Updates the authenticated recipient’s personal information, contact details, and mobile money payment information.
    //
    //Future<Recipient> patchV1RecipientsMe({ RecipientSelfUpdate recipientSelfUpdate }) async
    test('test patchV1RecipientsMe', () async {
      // TODO
    });

    // Verify OTP
    //
    // Verifies an OTP sent via Twilio and returns a Firebase custom token for authentication.
    //
    //Future<VerifyOtpResponse> postV1AuthVerifyOtp({ VerifyOtpRequest verifyOtpRequest }) async
    test('test postV1AuthVerifyOtp', () async {
      // TODO
    });

    // Import exchange rates
    //
    // Imports exchange rates from external API into the database.
    //
    //Future<ExchangeRatesImportSuccess> postV1ExchangeRate() async
    test('test postV1ExchangeRate', () async {
      // TODO
    });

    // Import payment files
    //
    // Imports payment files from post finance.
    //
    //Future<PaymentFilesImportResult> postV1PaymentFilesImport() async
    test('test postV1PaymentFilesImport', () async {
      // TODO
    });

    // Confirm payout
    //
    // Marks a specific payout as confirmed by the authenticated recipient.
    //
    //Future<Payout> postV1RecipientsMePayoutspayoutIdConfirm(String payoutId) async
    test('test postV1RecipientsMePayoutspayoutIdConfirm', () async {
      // TODO
    });

    // Contest payout
    //
    // Marks a specific payout as contested by the authenticated recipient.
    //
    //Future<Payout> postV1RecipientsMePayoutspayoutIdContest(String payoutId) async
    test('test postV1RecipientsMePayoutspayoutIdContest', () async {
      // TODO
    });

    // Process Stripe webhook events
    //
    // Handles multiple Stripe webhook events including charge.succeeded, charge.updated, and charge.failed to create/update contributions and contributors.
    //
    //Future<StripeWebhookResponse> postV1StripeWebhook() async
    test('test postV1StripeWebhook', () async {
      // TODO
    });

  });
}
