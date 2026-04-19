// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'balance_card_status.dart';

class BalanceCardStatusMapper extends EnumMapper<BalanceCardStatus> {
  BalanceCardStatusMapper._();

  static BalanceCardStatusMapper? _instance;
  static BalanceCardStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = BalanceCardStatusMapper._());
    }
    return _instance!;
  }

  static BalanceCardStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  BalanceCardStatus decode(dynamic value) {
    switch (value) {
      case r'allConfirmed':
        return BalanceCardStatus.allConfirmed;
      case r'recentToReview':
        return BalanceCardStatus.recentToReview;
      case r'needsAttention':
        return BalanceCardStatus.needsAttention;
      case r'onHold':
        return BalanceCardStatus.onHold;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(BalanceCardStatus self) {
    switch (self) {
      case BalanceCardStatus.allConfirmed:
        return r'allConfirmed';
      case BalanceCardStatus.recentToReview:
        return r'recentToReview';
      case BalanceCardStatus.needsAttention:
        return r'needsAttention';
      case BalanceCardStatus.onHold:
        return r'onHold';
    }
  }
}

extension BalanceCardStatusMapperExtension on BalanceCardStatus {
  String toValue() {
    BalanceCardStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<BalanceCardStatus>(this) as String;
  }
}

