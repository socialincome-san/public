// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payout_ui_status.dart';

class PayoutUiStatusMapper extends EnumMapper<PayoutUiStatus> {
  PayoutUiStatusMapper._();

  static PayoutUiStatusMapper? _instance;
  static PayoutUiStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutUiStatusMapper._());
    }
    return _instance!;
  }

  static PayoutUiStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  PayoutUiStatus decode(dynamic value) {
    switch (value) {
      case r'confirmed':
        return PayoutUiStatus.confirmed;
      case r'contested':
        return PayoutUiStatus.contested;
      case r'toReview':
        return PayoutUiStatus.toReview;
      case r'recentToReview':
        return PayoutUiStatus.recentToReview;
      case r'onHoldContested':
        return PayoutUiStatus.onHoldContested;
      case r'onHoldToReview':
        return PayoutUiStatus.onHoldToReview;
      case r'toBePaid':
        return PayoutUiStatus.toBePaid;
      case r'empty':
        return PayoutUiStatus.empty;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(PayoutUiStatus self) {
    switch (self) {
      case PayoutUiStatus.confirmed:
        return r'confirmed';
      case PayoutUiStatus.contested:
        return r'contested';
      case PayoutUiStatus.toReview:
        return r'toReview';
      case PayoutUiStatus.recentToReview:
        return r'recentToReview';
      case PayoutUiStatus.onHoldContested:
        return r'onHoldContested';
      case PayoutUiStatus.onHoldToReview:
        return r'onHoldToReview';
      case PayoutUiStatus.toBePaid:
        return r'toBePaid';
      case PayoutUiStatus.empty:
        return r'empty';
    }
  }
}

extension PayoutUiStatusMapperExtension on PayoutUiStatus {
  String toValue() {
    PayoutUiStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<PayoutUiStatus>(this) as String;
  }
}

