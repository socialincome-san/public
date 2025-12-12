//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class StripeWebhookResponse {
  /// Returns a new [StripeWebhookResponse] instance.
  StripeWebhookResponse({
    required this.received,
    this.data,
  });

  StripeWebhookResponseReceivedEnum received;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  StripeWebhookResponseData? data;

  @override
  bool operator ==(Object other) => identical(this, other) || other is StripeWebhookResponse &&
    other.received == received &&
    other.data == data;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (received.hashCode) +
    (data == null ? 0 : data!.hashCode);

  @override
  String toString() => 'StripeWebhookResponse[received=$received, data=$data]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'received'] = this.received;
    if (this.data != null) {
      json[r'data'] = this.data;
    } else {
      json[r'data'] = null;
    }
    return json;
  }

  /// Returns a new [StripeWebhookResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static StripeWebhookResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "StripeWebhookResponse[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "StripeWebhookResponse[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return StripeWebhookResponse(
        received: StripeWebhookResponseReceivedEnum.fromJson(json[r'received'])!,
        data: StripeWebhookResponseData.fromJson(json[r'data']),
      );
    }
    return null;
  }

  static List<StripeWebhookResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <StripeWebhookResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = StripeWebhookResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, StripeWebhookResponse> mapFromJson(dynamic json) {
    final map = <String, StripeWebhookResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = StripeWebhookResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of StripeWebhookResponse-objects as value to a dart map
  static Map<String, List<StripeWebhookResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<StripeWebhookResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = StripeWebhookResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'received',
  };
}


class StripeWebhookResponseReceivedEnum {
  /// Instantiate a new enum with the provided [value].
  const StripeWebhookResponseReceivedEnum._(this.value);

  /// The underlying value of this enum member.
  final bool value;

  @override
  String toString() => value.toString();

  bool toJson() => value;

  static const true_ = StripeWebhookResponseReceivedEnum._(true);

  /// List of all possible values in this [enum][StripeWebhookResponseReceivedEnum].
  static const values = <StripeWebhookResponseReceivedEnum>[
    true_,
  ];

  static StripeWebhookResponseReceivedEnum? fromJson(dynamic value) => StripeWebhookResponseReceivedEnumTypeTransformer().decode(value);

  static List<StripeWebhookResponseReceivedEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <StripeWebhookResponseReceivedEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = StripeWebhookResponseReceivedEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [StripeWebhookResponseReceivedEnum] to bool,
/// and [decode] dynamic data back to [StripeWebhookResponseReceivedEnum].
class StripeWebhookResponseReceivedEnumTypeTransformer {
  factory StripeWebhookResponseReceivedEnumTypeTransformer() => _instance ??= const StripeWebhookResponseReceivedEnumTypeTransformer._();

  const StripeWebhookResponseReceivedEnumTypeTransformer._();

  bool encode(StripeWebhookResponseReceivedEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a StripeWebhookResponseReceivedEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  StripeWebhookResponseReceivedEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case 'true': return StripeWebhookResponseReceivedEnum.true_;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [StripeWebhookResponseReceivedEnumTypeTransformer] instance.
  static StripeWebhookResponseReceivedEnumTypeTransformer? _instance;
}


