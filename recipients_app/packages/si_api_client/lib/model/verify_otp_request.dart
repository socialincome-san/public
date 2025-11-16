//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class VerifyOtpRequest {
  /// Returns a new [VerifyOtpRequest] instance.
  VerifyOtpRequest({
    required this.phoneNumber,
    required this.otp,
  });

  String phoneNumber;

  String otp;

  @override
  bool operator ==(Object other) => identical(this, other) || other is VerifyOtpRequest &&
    other.phoneNumber == phoneNumber &&
    other.otp == otp;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (phoneNumber.hashCode) +
    (otp.hashCode);

  @override
  String toString() => 'VerifyOtpRequest[phoneNumber=$phoneNumber, otp=$otp]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'phoneNumber'] = this.phoneNumber;
      json[r'otp'] = this.otp;
    return json;
  }

  /// Returns a new [VerifyOtpRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static VerifyOtpRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "VerifyOtpRequest[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "VerifyOtpRequest[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return VerifyOtpRequest(
        phoneNumber: mapValueOfType<String>(json, r'phoneNumber')!,
        otp: mapValueOfType<String>(json, r'otp')!,
      );
    }
    return null;
  }

  static List<VerifyOtpRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VerifyOtpRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VerifyOtpRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, VerifyOtpRequest> mapFromJson(dynamic json) {
    final map = <String, VerifyOtpRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = VerifyOtpRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of VerifyOtpRequest-objects as value to a dart map
  static Map<String, List<VerifyOtpRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<VerifyOtpRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = VerifyOtpRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'phoneNumber',
    'otp',
  };
}

