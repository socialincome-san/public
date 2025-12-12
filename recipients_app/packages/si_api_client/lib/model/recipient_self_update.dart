//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class RecipientSelfUpdate {
  /// Returns a new [RecipientSelfUpdate] instance.
  RecipientSelfUpdate({
    this.firstName,
    this.lastName,
    this.callingName,
    this.gender,
    this.dateOfBirth,
    this.language,
    this.email,
    this.contactPhone,
    this.paymentPhone,
    this.paymentProvider,
    this.successorName,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? firstName;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? lastName;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? callingName;

  RecipientSelfUpdateGenderEnum? gender;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? dateOfBirth;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? language;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? email;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? contactPhone;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? paymentPhone;

  RecipientSelfUpdatePaymentProviderEnum? paymentProvider;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? successorName;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RecipientSelfUpdate &&
    other.firstName == firstName &&
    other.lastName == lastName &&
    other.callingName == callingName &&
    other.gender == gender &&
    other.dateOfBirth == dateOfBirth &&
    other.language == language &&
    other.email == email &&
    other.contactPhone == contactPhone &&
    other.paymentPhone == paymentPhone &&
    other.paymentProvider == paymentProvider &&
    other.successorName == successorName;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (firstName == null ? 0 : firstName!.hashCode) +
    (lastName == null ? 0 : lastName!.hashCode) +
    (callingName == null ? 0 : callingName!.hashCode) +
    (gender == null ? 0 : gender!.hashCode) +
    (dateOfBirth == null ? 0 : dateOfBirth!.hashCode) +
    (language == null ? 0 : language!.hashCode) +
    (email == null ? 0 : email!.hashCode) +
    (contactPhone == null ? 0 : contactPhone!.hashCode) +
    (paymentPhone == null ? 0 : paymentPhone!.hashCode) +
    (paymentProvider == null ? 0 : paymentProvider!.hashCode) +
    (successorName == null ? 0 : successorName!.hashCode);

  @override
  String toString() => 'RecipientSelfUpdate[firstName=$firstName, lastName=$lastName, callingName=$callingName, gender=$gender, dateOfBirth=$dateOfBirth, language=$language, email=$email, contactPhone=$contactPhone, paymentPhone=$paymentPhone, paymentProvider=$paymentProvider, successorName=$successorName]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.firstName != null) {
      json[r'firstName'] = this.firstName;
    } else {
      json[r'firstName'] = null;
    }
    if (this.lastName != null) {
      json[r'lastName'] = this.lastName;
    } else {
      json[r'lastName'] = null;
    }
    if (this.callingName != null) {
      json[r'callingName'] = this.callingName;
    } else {
      json[r'callingName'] = null;
    }
    if (this.gender != null) {
      json[r'gender'] = this.gender;
    } else {
      json[r'gender'] = null;
    }
    if (this.dateOfBirth != null) {
      json[r'dateOfBirth'] = this.dateOfBirth;
    } else {
      json[r'dateOfBirth'] = null;
    }
    if (this.language != null) {
      json[r'language'] = this.language;
    } else {
      json[r'language'] = null;
    }
    if (this.email != null) {
      json[r'email'] = this.email;
    } else {
      json[r'email'] = null;
    }
    if (this.contactPhone != null) {
      json[r'contactPhone'] = this.contactPhone;
    } else {
      json[r'contactPhone'] = null;
    }
    if (this.paymentPhone != null) {
      json[r'paymentPhone'] = this.paymentPhone;
    } else {
      json[r'paymentPhone'] = null;
    }
    if (this.paymentProvider != null) {
      json[r'paymentProvider'] = this.paymentProvider;
    } else {
      json[r'paymentProvider'] = null;
    }
    if (this.successorName != null) {
      json[r'successorName'] = this.successorName;
    } else {
      json[r'successorName'] = null;
    }
    return json;
  }

  /// Returns a new [RecipientSelfUpdate] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RecipientSelfUpdate? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "RecipientSelfUpdate[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "RecipientSelfUpdate[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return RecipientSelfUpdate(
        firstName: mapValueOfType<String>(json, r'firstName'),
        lastName: mapValueOfType<String>(json, r'lastName'),
        callingName: mapValueOfType<String>(json, r'callingName'),
        gender: RecipientSelfUpdateGenderEnum.fromJson(json[r'gender']),
        dateOfBirth: mapValueOfType<String>(json, r'dateOfBirth'),
        language: mapValueOfType<String>(json, r'language'),
        email: mapValueOfType<String>(json, r'email'),
        contactPhone: mapValueOfType<String>(json, r'contactPhone'),
        paymentPhone: mapValueOfType<String>(json, r'paymentPhone'),
        paymentProvider: RecipientSelfUpdatePaymentProviderEnum.fromJson(json[r'paymentProvider']),
        successorName: mapValueOfType<String>(json, r'successorName'),
      );
    }
    return null;
  }

  static List<RecipientSelfUpdate> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RecipientSelfUpdate>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RecipientSelfUpdate.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RecipientSelfUpdate> mapFromJson(dynamic json) {
    final map = <String, RecipientSelfUpdate>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RecipientSelfUpdate.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RecipientSelfUpdate-objects as value to a dart map
  static Map<String, List<RecipientSelfUpdate>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RecipientSelfUpdate>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RecipientSelfUpdate.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class RecipientSelfUpdateGenderEnum {
  /// Instantiate a new enum with the provided [value].
  const RecipientSelfUpdateGenderEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const male = RecipientSelfUpdateGenderEnum._(r'male');
  static const female = RecipientSelfUpdateGenderEnum._(r'female');
  static const other = RecipientSelfUpdateGenderEnum._(r'other');
  static const private = RecipientSelfUpdateGenderEnum._(r'private');

  /// List of all possible values in this [enum][RecipientSelfUpdateGenderEnum].
  static const values = <RecipientSelfUpdateGenderEnum>[
    male,
    female,
    other,
    private,
  ];

  static RecipientSelfUpdateGenderEnum? fromJson(dynamic value) => RecipientSelfUpdateGenderEnumTypeTransformer().decode(value);

  static List<RecipientSelfUpdateGenderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RecipientSelfUpdateGenderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RecipientSelfUpdateGenderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [RecipientSelfUpdateGenderEnum] to String,
/// and [decode] dynamic data back to [RecipientSelfUpdateGenderEnum].
class RecipientSelfUpdateGenderEnumTypeTransformer {
  factory RecipientSelfUpdateGenderEnumTypeTransformer() => _instance ??= const RecipientSelfUpdateGenderEnumTypeTransformer._();

  const RecipientSelfUpdateGenderEnumTypeTransformer._();

  String encode(RecipientSelfUpdateGenderEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a RecipientSelfUpdateGenderEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  RecipientSelfUpdateGenderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'male': return RecipientSelfUpdateGenderEnum.male;
        case r'female': return RecipientSelfUpdateGenderEnum.female;
        case r'other': return RecipientSelfUpdateGenderEnum.other;
        case r'private': return RecipientSelfUpdateGenderEnum.private;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [RecipientSelfUpdateGenderEnumTypeTransformer] instance.
  static RecipientSelfUpdateGenderEnumTypeTransformer? _instance;
}



class RecipientSelfUpdatePaymentProviderEnum {
  /// Instantiate a new enum with the provided [value].
  const RecipientSelfUpdatePaymentProviderEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const orangeMoney = RecipientSelfUpdatePaymentProviderEnum._(r'orange_money');

  /// List of all possible values in this [enum][RecipientSelfUpdatePaymentProviderEnum].
  static const values = <RecipientSelfUpdatePaymentProviderEnum>[
    orangeMoney,
  ];

  static RecipientSelfUpdatePaymentProviderEnum? fromJson(dynamic value) => RecipientSelfUpdatePaymentProviderEnumTypeTransformer().decode(value);

  static List<RecipientSelfUpdatePaymentProviderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RecipientSelfUpdatePaymentProviderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RecipientSelfUpdatePaymentProviderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [RecipientSelfUpdatePaymentProviderEnum] to String,
/// and [decode] dynamic data back to [RecipientSelfUpdatePaymentProviderEnum].
class RecipientSelfUpdatePaymentProviderEnumTypeTransformer {
  factory RecipientSelfUpdatePaymentProviderEnumTypeTransformer() => _instance ??= const RecipientSelfUpdatePaymentProviderEnumTypeTransformer._();

  const RecipientSelfUpdatePaymentProviderEnumTypeTransformer._();

  String encode(RecipientSelfUpdatePaymentProviderEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a RecipientSelfUpdatePaymentProviderEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  RecipientSelfUpdatePaymentProviderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'orange_money': return RecipientSelfUpdatePaymentProviderEnum.orangeMoney;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [RecipientSelfUpdatePaymentProviderEnumTypeTransformer] instance.
  static RecipientSelfUpdatePaymentProviderEnumTypeTransformer? _instance;
}


