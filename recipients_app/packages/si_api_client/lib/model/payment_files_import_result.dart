//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class PaymentFilesImportResult {
  /// Returns a new [PaymentFilesImportResult] instance.
  PaymentFilesImportResult({
    required this.id,
    required this.contributionId,
    required this.type,
    required this.transactionId,
    this.metadata,
    required this.createdAt,
    this.updatedAt,
  });

  String id;

  String contributionId;

  String type;

  String transactionId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? metadata;

  DateTime createdAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  DateTime? updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PaymentFilesImportResult &&
    other.id == id &&
    other.contributionId == contributionId &&
    other.type == type &&
    other.transactionId == transactionId &&
    other.metadata == metadata &&
    other.createdAt == createdAt &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (contributionId.hashCode) +
    (type.hashCode) +
    (transactionId.hashCode) +
    (metadata == null ? 0 : metadata!.hashCode) +
    (createdAt.hashCode) +
    (updatedAt == null ? 0 : updatedAt!.hashCode);

  @override
  String toString() => 'PaymentFilesImportResult[id=$id, contributionId=$contributionId, type=$type, transactionId=$transactionId, metadata=$metadata, createdAt=$createdAt, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'contributionId'] = this.contributionId;
      json[r'type'] = this.type;
      json[r'transactionId'] = this.transactionId;
    if (this.metadata != null) {
      json[r'metadata'] = this.metadata;
    } else {
      json[r'metadata'] = null;
    }
      json[r'createdAt'] = this.createdAt.toUtc().toIso8601String();
    if (this.updatedAt != null) {
      json[r'updatedAt'] = this.updatedAt!.toUtc().toIso8601String();
    } else {
      json[r'updatedAt'] = null;
    }
    return json;
  }

  /// Returns a new [PaymentFilesImportResult] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PaymentFilesImportResult? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "PaymentFilesImportResult[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "PaymentFilesImportResult[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return PaymentFilesImportResult(
        id: mapValueOfType<String>(json, r'id')!,
        contributionId: mapValueOfType<String>(json, r'contributionId')!,
        type: mapValueOfType<String>(json, r'type')!,
        transactionId: mapValueOfType<String>(json, r'transactionId')!,
        metadata: mapValueOfType<String>(json, r'metadata'),
        createdAt: mapDateTime(json, r'createdAt', r'')!,
        updatedAt: mapDateTime(json, r'updatedAt', r''),
      );
    }
    return null;
  }

  static List<PaymentFilesImportResult> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PaymentFilesImportResult>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PaymentFilesImportResult.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PaymentFilesImportResult> mapFromJson(dynamic json) {
    final map = <String, PaymentFilesImportResult>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PaymentFilesImportResult.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PaymentFilesImportResult-objects as value to a dart map
  static Map<String, List<PaymentFilesImportResult>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PaymentFilesImportResult>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PaymentFilesImportResult.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'contributionId',
    'type',
    'transactionId',
    'createdAt',
  };
}

