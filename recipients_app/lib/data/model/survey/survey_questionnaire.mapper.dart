// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'survey_questionnaire.dart';

class SurveyQuestionnaireMapper extends EnumMapper<SurveyQuestionnaire> {
  SurveyQuestionnaireMapper._();

  static SurveyQuestionnaireMapper? _instance;
  static SurveyQuestionnaireMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyQuestionnaireMapper._());
    }
    return _instance!;
  }

  static SurveyQuestionnaire fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  SurveyQuestionnaire decode(dynamic value) {
    switch (value) {
      case r'onboarding':
        return SurveyQuestionnaire.onboarding;
      case r'checkin':
        return SurveyQuestionnaire.checkin;
      case r'offboarding':
        return SurveyQuestionnaire.offboarding;
      case "offboarded_checkin":
        return SurveyQuestionnaire.offboardedCheckin;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(SurveyQuestionnaire self) {
    switch (self) {
      case SurveyQuestionnaire.onboarding:
        return r'onboarding';
      case SurveyQuestionnaire.checkin:
        return r'checkin';
      case SurveyQuestionnaire.offboarding:
        return r'offboarding';
      case SurveyQuestionnaire.offboardedCheckin:
        return "offboarded_checkin";
    }
  }
}

extension SurveyQuestionnaireMapperExtension on SurveyQuestionnaire {
  dynamic toValue() {
    SurveyQuestionnaireMapper.ensureInitialized();
    return MapperContainer.globals.toValue<SurveyQuestionnaire>(this);
  }
}

