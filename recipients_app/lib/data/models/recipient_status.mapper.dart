// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'recipient_status.dart';

class RecipientStatusMapper extends EnumMapper<RecipientStatus> {
  RecipientStatusMapper._();

  static RecipientStatusMapper? _instance;
  static RecipientStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = RecipientStatusMapper._());
    }
    return _instance!;
  }

  static RecipientStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  RecipientStatus decode(dynamic value) {
    switch (value) {
      case r'active':
        return RecipientStatus.active;
      case r'suspended':
        return RecipientStatus.suspended;
      case r'waitlisted':
        return RecipientStatus.waitlisted;
      case r'designated':
        return RecipientStatus.designated;
      case r'former':
        return RecipientStatus.former;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(RecipientStatus self) {
    switch (self) {
      case RecipientStatus.active:
        return r'active';
      case RecipientStatus.suspended:
        return r'suspended';
      case RecipientStatus.waitlisted:
        return r'waitlisted';
      case RecipientStatus.designated:
        return r'designated';
      case RecipientStatus.former:
        return r'former';
    }
  }
}

extension RecipientStatusMapperExtension on RecipientStatus {
  String toValue() {
    RecipientStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<RecipientStatus>(this) as String;
  }
}

