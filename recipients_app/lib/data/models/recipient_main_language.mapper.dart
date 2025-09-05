// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'recipient_main_language.dart';

class RecipientMainLanguageMapper extends EnumMapper<RecipientMainLanguage> {
  RecipientMainLanguageMapper._();

  static RecipientMainLanguageMapper? _instance;
  static RecipientMainLanguageMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = RecipientMainLanguageMapper._());
    }
    return _instance!;
  }

  static RecipientMainLanguage fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  RecipientMainLanguage decode(dynamic value) {
    switch (value) {
      case r'en':
        return RecipientMainLanguage.en;
      case r'kri':
        return RecipientMainLanguage.kri;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(RecipientMainLanguage self) {
    switch (self) {
      case RecipientMainLanguage.en:
        return r'en';
      case RecipientMainLanguage.kri:
        return r'kri';
    }
  }
}

extension RecipientMainLanguageMapperExtension on RecipientMainLanguage {
  String toValue() {
    RecipientMainLanguageMapper.ensureInitialized();
    return MapperContainer.globals.toValue<RecipientMainLanguage>(this)
        as String;
  }
}

