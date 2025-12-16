// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payment_provider.dart';

class PaymentProviderMapper extends EnumMapper<PaymentProvider> {
  PaymentProviderMapper._();

  static PaymentProviderMapper? _instance;
  static PaymentProviderMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PaymentProviderMapper._());
    }
    return _instance!;
  }

  static PaymentProvider fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  PaymentProvider decode(dynamic value) {
    switch (value) {
      case r'orangeMoney':
        return PaymentProvider.orangeMoney;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(PaymentProvider self) {
    switch (self) {
      case PaymentProvider.orangeMoney:
        return r'orangeMoney';
    }
  }
}

extension PaymentProviderMapperExtension on PaymentProvider {
  String toValue() {
    PaymentProviderMapper.ensureInitialized();
    return MapperContainer.globals.toValue<PaymentProvider>(this) as String;
  }
}

