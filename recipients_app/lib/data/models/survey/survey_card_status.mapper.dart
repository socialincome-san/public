// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'survey_card_status.dart';

class SurveyCardStatusMapper extends EnumMapper<SurveyCardStatus> {
  SurveyCardStatusMapper._();

  static SurveyCardStatusMapper? _instance;
  static SurveyCardStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyCardStatusMapper._());
    }
    return _instance!;
  }

  static SurveyCardStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  SurveyCardStatus decode(dynamic value) {
    switch (value) {
      case r'newSurvey':
        return SurveyCardStatus.newSurvey;
      case r'firstReminder':
        return SurveyCardStatus.firstReminder;
      case r'overdue':
        return SurveyCardStatus.overdue;
      case r'answered':
        return SurveyCardStatus.answered;
      case r'missed':
        return SurveyCardStatus.missed;
      case r'upcoming':
        return SurveyCardStatus.upcoming;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(SurveyCardStatus self) {
    switch (self) {
      case SurveyCardStatus.newSurvey:
        return r'newSurvey';
      case SurveyCardStatus.firstReminder:
        return r'firstReminder';
      case SurveyCardStatus.overdue:
        return r'overdue';
      case SurveyCardStatus.answered:
        return r'answered';
      case SurveyCardStatus.missed:
        return r'missed';
      case SurveyCardStatus.upcoming:
        return r'upcoming';
    }
  }
}

extension SurveyCardStatusMapperExtension on SurveyCardStatus {
  String toValue() {
    SurveyCardStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<SurveyCardStatus>(this) as String;
  }
}

