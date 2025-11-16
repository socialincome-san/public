//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class Recipient {
  /// Returns a new [Recipient] instance.
  Recipient({
    required this.id,
    required this.contactId,
    required this.status,
    this.startDate,
    this.successorName,
    required this.termsAccepted,
    this.paymentInformationId,
    required this.programId,
    required this.localPartnerId,
    required this.contact,
    required this.program,
    required this.localPartner,
    this.paymentInformation,
    required this.createdAt,
    this.updatedAt,
  });

  String id;

  String contactId;

  String status;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? startDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? successorName;

  bool termsAccepted;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? paymentInformationId;

  String programId;

  String localPartnerId;

  Object contact;

  Object program;

  Object localPartner;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  PaymentInformation? paymentInformation;

  String createdAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is Recipient &&
    other.id == id &&
    other.contactId == contactId &&
    other.status == status &&
    other.startDate == startDate &&
    other.successorName == successorName &&
    other.termsAccepted == termsAccepted &&
    other.paymentInformationId == paymentInformationId &&
    other.programId == programId &&
    other.localPartnerId == localPartnerId &&
    other.contact == contact &&
    other.program == program &&
    other.localPartner == localPartner &&
    other.paymentInformation == paymentInformation &&
    other.createdAt == createdAt &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (contactId.hashCode) +
    (status.hashCode) +
    (startDate == null ? 0 : startDate!.hashCode) +
    (successorName == null ? 0 : successorName!.hashCode) +
    (termsAccepted.hashCode) +
    (paymentInformationId == null ? 0 : paymentInformationId!.hashCode) +
    (programId.hashCode) +
    (localPartnerId.hashCode) +
    (contact.hashCode) +
    (program.hashCode) +
    (localPartner.hashCode) +
    (paymentInformation == null ? 0 : paymentInformation!.hashCode) +
    (createdAt.hashCode) +
    (updatedAt == null ? 0 : updatedAt!.hashCode);

  @override
  String toString() => 'Recipient[id=$id, contactId=$contactId, status=$status, startDate=$startDate, successorName=$successorName, termsAccepted=$termsAccepted, paymentInformationId=$paymentInformationId, programId=$programId, localPartnerId=$localPartnerId, contact=$contact, program=$program, localPartner=$localPartner, paymentInformation=$paymentInformation, createdAt=$createdAt, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'contactId'] = this.contactId;
      json[r'status'] = this.status;
    if (this.startDate != null) {
      json[r'startDate'] = this.startDate;
    } else {
      json[r'startDate'] = null;
    }
    if (this.successorName != null) {
      json[r'successorName'] = this.successorName;
    } else {
      json[r'successorName'] = null;
    }
      json[r'termsAccepted'] = this.termsAccepted;
    if (this.paymentInformationId != null) {
      json[r'paymentInformationId'] = this.paymentInformationId;
    } else {
      json[r'paymentInformationId'] = null;
    }
      json[r'programId'] = this.programId;
      json[r'localPartnerId'] = this.localPartnerId;
      json[r'contact'] = this.contact;
      json[r'program'] = this.program;
      json[r'localPartner'] = this.localPartner;
    if (this.paymentInformation != null) {
      json[r'paymentInformation'] = this.paymentInformation;
    } else {
      json[r'paymentInformation'] = null;
    }
      json[r'createdAt'] = this.createdAt;
    if (this.updatedAt != null) {
      json[r'updatedAt'] = this.updatedAt;
    } else {
      json[r'updatedAt'] = null;
    }
    return json;
  }

  /// Returns a new [Recipient] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static Recipient? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "Recipient[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "Recipient[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return Recipient(
        id: mapValueOfType<String>(json, r'id')!,
        contactId: mapValueOfType<String>(json, r'contactId')!,
        status: mapValueOfType<String>(json, r'status')!,
        startDate: mapValueOfType<String>(json, r'startDate'),
        successorName: mapValueOfType<String>(json, r'successorName'),
        termsAccepted: mapValueOfType<bool>(json, r'termsAccepted')!,
        paymentInformationId: mapValueOfType<String>(json, r'paymentInformationId'),
        programId: mapValueOfType<String>(json, r'programId')!,
        localPartnerId: mapValueOfType<String>(json, r'localPartnerId')!,
        contact: mapValueOfType<Object>(json, r'contact')!,
        program: mapValueOfType<Object>(json, r'program')!,
        localPartner: mapValueOfType<Object>(json, r'localPartner')!,
        paymentInformation: PaymentInformation.fromJson(json[r'paymentInformation']),
        createdAt: mapValueOfType<String>(json, r'createdAt')!,
        updatedAt: mapValueOfType<String>(json, r'updatedAt'),
      );
    }
    return null;
  }

  static List<Recipient> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <Recipient>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = Recipient.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, Recipient> mapFromJson(dynamic json) {
    final map = <String, Recipient>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = Recipient.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of Recipient-objects as value to a dart map
  static Map<String, List<Recipient>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<Recipient>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = Recipient.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'contactId',
    'status',
    'termsAccepted',
    'programId',
    'localPartnerId',
    'contact',
    'program',
    'localPartner',
    'createdAt',
  };
}

