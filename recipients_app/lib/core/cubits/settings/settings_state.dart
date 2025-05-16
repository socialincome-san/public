part of "settings_cubit.dart";

enum SettingsStatus { initial, loading, success, failure }

class SettingsState extends Equatable {
  final SettingsStatus status;
  final Locale locale;
  final Exception? exception;

  const SettingsState({this.status = SettingsStatus.initial, required this.locale, this.exception});

  @override
  List<Object?> get props => [status, locale, exception];
}
