// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'language_code.dart';

class LanguageCodeMapper extends EnumMapper<LanguageCode> {
  LanguageCodeMapper._();

  static LanguageCodeMapper? _instance;
  static LanguageCodeMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = LanguageCodeMapper._());
    }
    return _instance!;
  }

  static LanguageCode fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  LanguageCode decode(dynamic value) {
    switch (value) {
      case r'de':
        return LanguageCode.de;
      case r'en':
        return LanguageCode.en;
      case r'it':
        return LanguageCode.it;
      case r'fr':
        return LanguageCode.fr;
      case r'kri':
        return LanguageCode.kri;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(LanguageCode self) {
    switch (self) {
      case LanguageCode.de:
        return r'de';
      case LanguageCode.en:
        return r'en';
      case LanguageCode.it:
        return r'it';
      case LanguageCode.fr:
        return r'fr';
      case LanguageCode.kri:
        return r'kri';
    }
  }
}

extension LanguageCodeMapperExtension on LanguageCode {
  String toValue() {
    LanguageCodeMapper.ensureInitialized();
    return MapperContainer.globals.toValue<LanguageCode>(this) as String;
  }
}

