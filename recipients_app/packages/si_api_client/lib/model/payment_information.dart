//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class PaymentInformation {
  /// Returns a new [PaymentInformation] instance.
  PaymentInformation({
    required this.id,
    required this.provider,
    required this.code,
    required this.phoneId,
    required this.phone,
    required this.createdAt,
    this.updatedAt,
  });

  String id;

  String provider;

  String code;

  String phoneId;

  Object phone;

  String createdAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PaymentInformation &&
    other.id == id &&
    other.provider == provider &&
    other.code == code &&
    other.phoneId == phoneId &&
    other.phone == phone &&
    other.createdAt == createdAt &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (provider.hashCode) +
    (code.hashCode) +
    (phoneId.hashCode) +
    (phone.hashCode) +
    (createdAt.hashCode) +
    (updatedAt == null ? 0 : updatedAt!.hashCode);

  @override
  String toString() => 'PaymentInformation[id=$id, provider=$provider, code=$code, phoneId=$phoneId, phone=$phone, createdAt=$createdAt, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'provider'] = this.provider;
      json[r'code'] = this.code;
      json[r'phoneId'] = this.phoneId;
      json[r'phone'] = this.phone;
      json[r'createdAt'] = this.createdAt;
    if (this.updatedAt != null) {
      json[r'updatedAt'] = this.updatedAt;
    } else {
      json[r'updatedAt'] = null;
    }
    return json;
  }

  /// Returns a new [PaymentInformation] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PaymentInformation? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "PaymentInformation[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "PaymentInformation[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return PaymentInformation(
        id: mapValueOfType<String>(json, r'id')!,
        provider: mapValueOfType<String>(json, r'provider')!,
        code: mapValueOfType<String>(json, r'code')!,
        phoneId: mapValueOfType<String>(json, r'phoneId')!,
        phone: mapValueOfType<Object>(json, r'phone')!,
        createdAt: mapValueOfType<String>(json, r'createdAt')!,
        updatedAt: mapValueOfType<String>(json, r'updatedAt'),
      );
    }
    return null;
  }

  static List<PaymentInformation> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PaymentInformation>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PaymentInformation.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PaymentInformation> mapFromJson(dynamic json) {
    final map = <String, PaymentInformation>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PaymentInformation.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PaymentInformation-objects as value to a dart map
  static Map<String, List<PaymentInformation>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PaymentInformation>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PaymentInformation.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'provider',
    'code',
    'phoneId',
    'phone',
    'createdAt',
  };
}

