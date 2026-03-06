part of "settings_cubit.dart";

enum SettingsStatus {
  initial,
  loading,
  success,
  failure,
}

@MappableClass()
class SettingsState with SettingsStateMappable {
  final SettingsStatus status;
  final Locale locale;
  final Exception? exception;

  const SettingsState({
    this.status = SettingsStatus.initial,
    required this.locale,
    this.exception,
  });
}
