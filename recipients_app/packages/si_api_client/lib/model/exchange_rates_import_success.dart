//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class ExchangeRatesImportSuccess {
  /// Returns a new [ExchangeRatesImportSuccess] instance.
  ExchangeRatesImportSuccess({
    required this.success,
  });

  ExchangeRatesImportSuccessSuccessEnum success;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ExchangeRatesImportSuccess &&
    other.success == success;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (success.hashCode);

  @override
  String toString() => 'ExchangeRatesImportSuccess[success=$success]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'success'] = this.success;
    return json;
  }

  /// Returns a new [ExchangeRatesImportSuccess] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ExchangeRatesImportSuccess? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "ExchangeRatesImportSuccess[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "ExchangeRatesImportSuccess[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return ExchangeRatesImportSuccess(
        success: ExchangeRatesImportSuccessSuccessEnum.fromJson(json[r'success'])!,
      );
    }
    return null;
  }

  static List<ExchangeRatesImportSuccess> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ExchangeRatesImportSuccess>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ExchangeRatesImportSuccess.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ExchangeRatesImportSuccess> mapFromJson(dynamic json) {
    final map = <String, ExchangeRatesImportSuccess>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ExchangeRatesImportSuccess.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ExchangeRatesImportSuccess-objects as value to a dart map
  static Map<String, List<ExchangeRatesImportSuccess>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ExchangeRatesImportSuccess>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ExchangeRatesImportSuccess.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'success',
  };
}


class ExchangeRatesImportSuccessSuccessEnum {
  /// Instantiate a new enum with the provided [value].
  const ExchangeRatesImportSuccessSuccessEnum._(this.value);

  /// The underlying value of this enum member.
  final bool value;

  @override
  String toString() => value.toString();

  bool toJson() => value;

  static const true_ = ExchangeRatesImportSuccessSuccessEnum._('true');

  /// List of all possible values in this [enum][ExchangeRatesImportSuccessSuccessEnum].
  static const values = <ExchangeRatesImportSuccessSuccessEnum>[
    true_,
  ];

  static ExchangeRatesImportSuccessSuccessEnum? fromJson(dynamic value) => ExchangeRatesImportSuccessSuccessEnumTypeTransformer().decode(value);

  static List<ExchangeRatesImportSuccessSuccessEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ExchangeRatesImportSuccessSuccessEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ExchangeRatesImportSuccessSuccessEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ExchangeRatesImportSuccessSuccessEnum] to bool,
/// and [decode] dynamic data back to [ExchangeRatesImportSuccessSuccessEnum].
class ExchangeRatesImportSuccessSuccessEnumTypeTransformer {
  factory ExchangeRatesImportSuccessSuccessEnumTypeTransformer() => _instance ??= const ExchangeRatesImportSuccessSuccessEnumTypeTransformer._();

  const ExchangeRatesImportSuccessSuccessEnumTypeTransformer._();

  bool encode(ExchangeRatesImportSuccessSuccessEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a ExchangeRatesImportSuccessSuccessEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ExchangeRatesImportSuccessSuccessEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case 'true': return ExchangeRatesImportSuccessSuccessEnum.true_;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [ExchangeRatesImportSuccessSuccessEnumTypeTransformer] instance.
  static ExchangeRatesImportSuccessSuccessEnumTypeTransformer? _instance;
}


