import "package:app/data/models/language_code.dart";
import "package:app/data/repositories/repositories.dart";
import "package:dart_mappable/dart_mappable.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "settings_cubit.mapper.dart";
part "settings_state.dart";

class SettingsCubit extends Cubit<SettingsState> {
  final Locale defaultLocale;
  final MessagingRepository messagingRepository;
  final CrashReportingRepository crashReportingRepository;

  SettingsCubit({
    required this.defaultLocale,
    required this.messagingRepository,
    required this.crashReportingRepository,
  }) : super(SettingsState(locale: defaultLocale));

  Future<void> initMessaging() async {
    try {
      await messagingRepository.initNotifications();
      await messagingRepository.updateNotificationTopics(
        state.locale.languageCode == "kri" ? LanguageCode.kri : LanguageCode.en,
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
    }
  }

  /// Currently english = en and krio = kri are supported
  Future<void> changeLanguage(LanguageCode language) async {
    final locale = language == LanguageCode.kri
        ? const Locale("kri")
        : const Locale("en", "US");

    // check whats the current language
    // if its the same as the new language, do nothing
    if (state.locale == locale) return;

    emit(SettingsState(status: SettingsStatus.success, locale: locale));

    try {
      await messagingRepository.updateNotificationTopics(language);
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
    }
  }
}
