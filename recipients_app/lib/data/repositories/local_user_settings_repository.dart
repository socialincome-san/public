import "package:shared_preferences/shared_preferences.dart";

/// Settings stored only on this device. Only reads and writes values; deciding
/// what they mean is up to the cubits.
///
/// Stored in SharedPreferences instead of [AppCacheDatabase], because the cache
/// lives in the OS cache directory and is cleared on logout, which would reset
/// these settings.
///
/// Per-recipient keys are namespaced by recipient ID, so several recipients can
/// use the same device without sharing settings.
class LocalUserSettingsRepository {
  /// Device-wide, because the recipient ID isn't known yet at login time.
  static const _welcomeMessagePendingKey = "dashboard_welcome_message_pending";
  static const _welcomeMessageSeenKeyPrefix = "dashboard_welcome_message_seen_";

  final SharedPreferencesAsync _preferences;

  LocalUserSettingsRepository({SharedPreferencesAsync? preferences})
    : _preferences = preferences ?? SharedPreferencesAsync();

  Future<bool> isWelcomeMessagePending() async {
    return await _preferences.getBool(_welcomeMessagePendingKey) ?? false;
  }

  Future<void> setWelcomeMessagePending({required bool pending}) {
    return pending
        ? _preferences.setBool(_welcomeMessagePendingKey, true)
        : _preferences.remove(_welcomeMessagePendingKey);
  }

  Future<bool> hasSeenWelcomeMessage(String recipientId) async {
    return await _preferences.getBool("$_welcomeMessageSeenKeyPrefix$recipientId") ?? false;
  }

  Future<void> markWelcomeMessageSeen(String recipientId) {
    return _preferences.setBool("$_welcomeMessageSeenKeyPrefix$recipientId", true);
  }
}
