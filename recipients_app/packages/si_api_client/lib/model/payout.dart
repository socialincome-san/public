//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class Payout {
  /// Returns a new [Payout] instance.
  Payout({
    required this.id,
    required this.amount,
    this.amountChf,
    required this.currency,
    required this.paymentAt,
    required this.status,
    this.phoneNumber,
    this.comments,
    required this.recipientId,
    required this.createdAt,
    this.updatedAt,
  });

  String id;

  num amount;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? amountChf;

  String currency;

  String paymentAt;

  String status;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? phoneNumber;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? comments;

  String recipientId;

  String createdAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is Payout &&
    other.id == id &&
    other.amount == amount &&
    other.amountChf == amountChf &&
    other.currency == currency &&
    other.paymentAt == paymentAt &&
    other.status == status &&
    other.phoneNumber == phoneNumber &&
    other.comments == comments &&
    other.recipientId == recipientId &&
    other.createdAt == createdAt &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (amount.hashCode) +
    (amountChf == null ? 0 : amountChf!.hashCode) +
    (currency.hashCode) +
    (paymentAt.hashCode) +
    (status.hashCode) +
    (phoneNumber == null ? 0 : phoneNumber!.hashCode) +
    (comments == null ? 0 : comments!.hashCode) +
    (recipientId.hashCode) +
    (createdAt.hashCode) +
    (updatedAt == null ? 0 : updatedAt!.hashCode);

  @override
  String toString() => 'Payout[id=$id, amount=$amount, amountChf=$amountChf, currency=$currency, paymentAt=$paymentAt, status=$status, phoneNumber=$phoneNumber, comments=$comments, recipientId=$recipientId, createdAt=$createdAt, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'amount'] = this.amount;
    if (this.amountChf != null) {
      json[r'amountChf'] = this.amountChf;
    } else {
      json[r'amountChf'] = null;
    }
      json[r'currency'] = this.currency;
      json[r'paymentAt'] = this.paymentAt;
      json[r'status'] = this.status;
    if (this.phoneNumber != null) {
      json[r'phoneNumber'] = this.phoneNumber;
    } else {
      json[r'phoneNumber'] = null;
    }
    if (this.comments != null) {
      json[r'comments'] = this.comments;
    } else {
      json[r'comments'] = null;
    }
      json[r'recipientId'] = this.recipientId;
      json[r'createdAt'] = this.createdAt;
    if (this.updatedAt != null) {
      json[r'updatedAt'] = this.updatedAt;
    } else {
      json[r'updatedAt'] = null;
    }
    return json;
  }

  /// Returns a new [Payout] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static Payout? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "Payout[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "Payout[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return Payout(
        id: mapValueOfType<String>(json, r'id')!,
        amount: num.parse('${json[r'amount']}'),
        amountChf: num.parse('${json[r'amountChf']}'),
        currency: mapValueOfType<String>(json, r'currency')!,
        paymentAt: mapValueOfType<String>(json, r'paymentAt')!,
        status: mapValueOfType<String>(json, r'status')!,
        phoneNumber: mapValueOfType<String>(json, r'phoneNumber'),
        comments: mapValueOfType<String>(json, r'comments'),
        recipientId: mapValueOfType<String>(json, r'recipientId')!,
        createdAt: mapValueOfType<String>(json, r'createdAt')!,
        updatedAt: mapValueOfType<String>(json, r'updatedAt'),
      );
    }
    return null;
  }

  static List<Payout> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <Payout>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = Payout.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, Payout> mapFromJson(dynamic json) {
    final map = <String, Payout>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = Payout.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of Payout-objects as value to a dart map
  static Map<String, List<Payout>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<Payout>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = Payout.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'amount',
    'currency',
    'paymentAt',
    'status',
    'recipientId',
    'createdAt',
  };
}

