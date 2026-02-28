// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payout_status.dart';

class PayoutStatusMapper extends EnumMapper<PayoutStatus> {
  PayoutStatusMapper._();

  static PayoutStatusMapper? _instance;
  static PayoutStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutStatusMapper._());
    }
    return _instance!;
  }

  static PayoutStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  PayoutStatus decode(dynamic value) {
    switch (value) {
      case r'created':
        return PayoutStatus.created;
      case r'paid':
        return PayoutStatus.paid;
      case r'confirmed':
        return PayoutStatus.confirmed;
      case r'contested':
        return PayoutStatus.contested;
      case r'failed':
        return PayoutStatus.failed;
      case r'other':
        return PayoutStatus.other;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(PayoutStatus self) {
    switch (self) {
      case PayoutStatus.created:
        return r'created';
      case PayoutStatus.paid:
        return r'paid';
      case PayoutStatus.confirmed:
        return r'confirmed';
      case PayoutStatus.contested:
        return r'contested';
      case PayoutStatus.failed:
        return r'failed';
      case PayoutStatus.other:
        return r'other';
    }
  }
}

extension PayoutStatusMapperExtension on PayoutStatus {
  String toValue() {
    PayoutStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<PayoutStatus>(this) as String;
  }
}

