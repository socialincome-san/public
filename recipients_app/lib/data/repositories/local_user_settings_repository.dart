import "package:shared_preferences/shared_preferences.dart";

/// Per-recipient settings stored only on this device, such as whether the
/// dashboard welcome message has been dismissed.
///
/// Stored in SharedPreferences instead of [AppCacheDatabase], because the cache
/// lives in the OS cache directory and is cleared on logout, which would reset
/// these settings.
///
/// Keys are namespaced by recipient ID, so several recipients can use the same
/// device without sharing settings.
class LocalUserSettingsRepository {
  static const _welcomeMessageSeenKeyPrefix = "dashboard_welcome_message_seen_";

  final SharedPreferencesAsync _preferences;

  LocalUserSettingsRepository({SharedPreferencesAsync? preferences})
    : _preferences = preferences ?? SharedPreferencesAsync();

  Future<bool> hasSeenWelcomeMessage(String recipientId) async {
    return await _preferences.getBool("$_welcomeMessageSeenKeyPrefix$recipientId") ?? false;
  }

  Future<void> markWelcomeMessageSeen(String recipientId) {
    return _preferences.setBool("$_welcomeMessageSeenKeyPrefix$recipientId", true);
  }
}
