/* class ExchangeRatesImportSuccess {
  /// Returns a new [ExchangeRatesImportSuccess] instance.
  ExchangeRatesImportSuccess({
    required this.success,
  });

  ExchangeRatesImportSuccessSuccessEnum success;
}

class ExchangeRatesImportSuccessSuccessEnum {
  /// Instantiate a new enum with the provided [value].
  const ExchangeRatesImportSuccessSuccessEnum._(this.value);

  /// The underlying value of this enum member.
  final bool value;

  @override
  String toString() => value.toString();

  bool toJson() => value;

  static const true_ = ExchangeRatesImportSuccessSuccessEnum._("true");

  /// List of all possible values in this [enum][ExchangeRatesImportSuccessSuccessEnum].
  static const values = <ExchangeRatesImportSuccessSuccessEnum>[
    true_,
  ];

  static ExchangeRatesImportSuccessSuccessEnum? fromJson(dynamic value) =>
      ExchangeRatesImportSuccessSuccessEnumTypeTransformer().decode(value);

  static List<ExchangeRatesImportSuccessSuccessEnum> listFromJson(
    dynamic json, {
    bool growable = false,
  }) {
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
  factory ExchangeRatesImportSuccessSuccessEnumTypeTransformer() =>
      _instance ??= const ExchangeRatesImportSuccessSuccessEnumTypeTransformer._();

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
        case "true":
          return ExchangeRatesImportSuccessSuccessEnum.true_;
        default:
          if (!allowNull) {
            throw ArgumentError("Unknown enum value to decode: $data");
          }
      }
    }
    return null;
  }

  /// Singleton [ExchangeRatesImportSuccessSuccessEnumTypeTransformer] instance.
  static ExchangeRatesImportSuccessSuccessEnumTypeTransformer? _instance;
}
 */
