//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class Program {
  /// Returns a new [Program] instance.
  Program({
    required this.id,
    required this.name,
    required this.country,
    required this.payoutAmount,
    required this.payoutCurrency,
    required this.payoutInterval,
    required this.totalPayments,
    required this.ownerOrganizationId,
    required this.createdAt,
    this.updatedAt,
  });

  String id;

  String name;

  String country;

  num payoutAmount;

  String payoutCurrency;

  num payoutInterval;

  num totalPayments;

  String ownerOrganizationId;

  String createdAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is Program &&
    other.id == id &&
    other.name == name &&
    other.country == country &&
    other.payoutAmount == payoutAmount &&
    other.payoutCurrency == payoutCurrency &&
    other.payoutInterval == payoutInterval &&
    other.totalPayments == totalPayments &&
    other.ownerOrganizationId == ownerOrganizationId &&
    other.createdAt == createdAt &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (name.hashCode) +
    (country.hashCode) +
    (payoutAmount.hashCode) +
    (payoutCurrency.hashCode) +
    (payoutInterval.hashCode) +
    (totalPayments.hashCode) +
    (ownerOrganizationId.hashCode) +
    (createdAt.hashCode) +
    (updatedAt == null ? 0 : updatedAt!.hashCode);

  @override
  String toString() => 'Program[id=$id, name=$name, country=$country, payoutAmount=$payoutAmount, payoutCurrency=$payoutCurrency, payoutInterval=$payoutInterval, totalPayments=$totalPayments, ownerOrganizationId=$ownerOrganizationId, createdAt=$createdAt, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'name'] = this.name;
      json[r'country'] = this.country;
      json[r'payoutAmount'] = this.payoutAmount;
      json[r'payoutCurrency'] = this.payoutCurrency;
      json[r'payoutInterval'] = this.payoutInterval;
      json[r'totalPayments'] = this.totalPayments;
      json[r'ownerOrganizationId'] = this.ownerOrganizationId;
      json[r'createdAt'] = this.createdAt;
    if (this.updatedAt != null) {
      json[r'updatedAt'] = this.updatedAt;
    } else {
      json[r'updatedAt'] = null;
    }
    return json;
  }

  /// Returns a new [Program] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static Program? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "Program[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "Program[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return Program(
        id: mapValueOfType<String>(json, r'id')!,
        name: mapValueOfType<String>(json, r'name')!,
        country: mapValueOfType<String>(json, r'country')!,
        payoutAmount: num.parse('${json[r'payoutAmount']}'),
        payoutCurrency: mapValueOfType<String>(json, r'payoutCurrency')!,
        payoutInterval: num.parse('${json[r'payoutInterval']}'),
        totalPayments: num.parse('${json[r'totalPayments']}'),
        ownerOrganizationId: mapValueOfType<String>(json, r'ownerOrganizationId')!,
        createdAt: mapValueOfType<String>(json, r'createdAt')!,
        updatedAt: mapValueOfType<String>(json, r'updatedAt'),
      );
    }
    return null;
  }

  static List<Program> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <Program>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = Program.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, Program> mapFromJson(dynamic json) {
    final map = <String, Program>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = Program.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of Program-objects as value to a dart map
  static Map<String, List<Program>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<Program>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = Program.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'name',
    'country',
    'payoutAmount',
    'payoutCurrency',
    'payoutInterval',
    'totalPayments',
    'ownerOrganizationId',
    'createdAt',
  };
}

