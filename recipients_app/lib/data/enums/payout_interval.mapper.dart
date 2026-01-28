// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payout_interval.dart';

class PayoutIntervalMapper extends EnumMapper<PayoutInterval> {
  PayoutIntervalMapper._();

  static PayoutIntervalMapper? _instance;
  static PayoutIntervalMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutIntervalMapper._());
    }
    return _instance!;
  }

  static PayoutInterval fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  PayoutInterval decode(dynamic value) {
    switch (value) {
      case r'monthly':
        return PayoutInterval.monthly;
      case r'quarterly':
        return PayoutInterval.quarterly;
      case r'yearly':
        return PayoutInterval.yearly;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(PayoutInterval self) {
    switch (self) {
      case PayoutInterval.monthly:
        return r'monthly';
      case PayoutInterval.quarterly:
        return r'quarterly';
      case PayoutInterval.yearly:
        return r'yearly';
    }
  }
}

extension PayoutIntervalMapperExtension on PayoutInterval {
  String toValue() {
    PayoutIntervalMapper.ensureInitialized();
    return MapperContainer.globals.toValue<PayoutInterval>(this) as String;
  }
}

