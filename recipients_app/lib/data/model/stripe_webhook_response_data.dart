import "package:dart_mappable/dart_mappable.dart";

part "stripe_webhook_response_data.mapper.dart";

@MappableClass()
class StripeWebhookResponseData with StripeWebhookResponseDataMappable {
  /// Returns a new [StripeWebhookResponseData] instance.
  StripeWebhookResponseData({
    this.contributionId,
    this.contributorId,
    this.isNewContributor,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? contributionId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? contributorId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isNewContributor;
}
