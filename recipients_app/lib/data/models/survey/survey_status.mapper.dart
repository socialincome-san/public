// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'survey_status.dart';

class SurveyStatusMapper extends EnumMapper<SurveyStatus> {
  SurveyStatusMapper._();

  static SurveyStatusMapper? _instance;
  static SurveyStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyStatusMapper._());
    }
    return _instance!;
  }

  static SurveyStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  SurveyStatus decode(dynamic value) {
    switch (value) {
      case "new":
        return SurveyStatus.created;
      case r'sent':
        return SurveyStatus.sent;
      case r'scheduled':
        return SurveyStatus.scheduled;
      case "in_progress":
        return SurveyStatus.inProgress;
      case r'completed':
        return SurveyStatus.completed;
      case r'missed':
        return SurveyStatus.missed;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(SurveyStatus self) {
    switch (self) {
      case SurveyStatus.created:
        return "new";
      case SurveyStatus.sent:
        return r'sent';
      case SurveyStatus.scheduled:
        return r'scheduled';
      case SurveyStatus.inProgress:
        return "in_progress";
      case SurveyStatus.completed:
        return r'completed';
      case SurveyStatus.missed:
        return r'missed';
    }
  }
}

extension SurveyStatusMapperExtension on SurveyStatus {
  dynamic toValue() {
    SurveyStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<SurveyStatus>(this);
  }
}

