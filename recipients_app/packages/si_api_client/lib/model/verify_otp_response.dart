//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class VerifyOtpResponse {
  /// Returns a new [VerifyOtpResponse] instance.
  VerifyOtpResponse({
    required this.customToken,
    required this.isNewUser,
    required this.uid,
  });

  String customToken;

  bool isNewUser;

  String uid;

  @override
  bool operator ==(Object other) => identical(this, other) || other is VerifyOtpResponse &&
    other.customToken == customToken &&
    other.isNewUser == isNewUser &&
    other.uid == uid;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (customToken.hashCode) +
    (isNewUser.hashCode) +
    (uid.hashCode);

  @override
  String toString() => 'VerifyOtpResponse[customToken=$customToken, isNewUser=$isNewUser, uid=$uid]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'customToken'] = this.customToken;
      json[r'isNewUser'] = this.isNewUser;
      json[r'uid'] = this.uid;
    return json;
  }

  /// Returns a new [VerifyOtpResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static VerifyOtpResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "VerifyOtpResponse[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "VerifyOtpResponse[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return VerifyOtpResponse(
        customToken: mapValueOfType<String>(json, r'customToken')!,
        isNewUser: mapValueOfType<bool>(json, r'isNewUser')!,
        uid: mapValueOfType<String>(json, r'uid')!,
      );
    }
    return null;
  }

  static List<VerifyOtpResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VerifyOtpResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VerifyOtpResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, VerifyOtpResponse> mapFromJson(dynamic json) {
    final map = <String, VerifyOtpResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = VerifyOtpResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of VerifyOtpResponse-objects as value to a dart map
  static Map<String, List<VerifyOtpResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<VerifyOtpResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = VerifyOtpResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'customToken',
    'isNewUser',
    'uid',
  };
}

