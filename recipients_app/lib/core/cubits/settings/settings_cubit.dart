import "package:bloc/bloc.dart";
import "package:equatable/equatable.dart";
import "package:flutter/material.dart";

part "settings_state.dart";

class SettingsCubit extends Cubit<SettingsState> {
  final Locale defaultLocale;

  SettingsCubit({
    required this.defaultLocale,
  }) : super(const SettingsState()) {
    initLanguage(defaultLocale);
  }

  /// Currently english = en and krio = kri are supported
  void changeLanguage(String languageString) {
    final locale = languageString == "krio"
        ? const Locale("kri")
        : const Locale("en", "US");

    emit(
      SettingsState(
        status: SettingsStatus.success,
        locale: locale,
      ),
    );
  }

  void initLanguage(Locale defaultLocale) {
    // if defaultLocale is krio, we need to make an artifical switching
    // to load the data into memory
    if (defaultLocale.languageCode == "kri") {
      changeLanguage("english");
      changeLanguage("krio");
    } else {
      emit(
        SettingsState(
          status: SettingsStatus.success,
          locale: defaultLocale,
        ),
      );
    }
  }
}
