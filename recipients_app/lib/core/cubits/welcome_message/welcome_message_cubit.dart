import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:flutter_bloc/flutter_bloc.dart";

/// State is whether the dashboard welcome message should be shown.
///
/// The message is shown once per recipient, and only after a login: login marks
/// it as pending (see [SignupCubit.submit]). Recipients who were already logged
/// in when this feature was released never see it. Only if they logout and login again.
class WelcomeMessageCubit extends Cubit<bool> {
  final Recipient recipient;
  final LocalUserSettingsRepository localUserSettingsRepository;
  final CrashReportingRepository crashReportingRepository;

  WelcomeMessageCubit({
    required this.recipient,
    required this.localUserSettingsRepository,
    required this.crashReportingRepository,
  }) : super(false);

  Future<void> load() async {
    try {
      final isPending = await localUserSettingsRepository.isWelcomeMessagePending();
      if (!isPending) return;
      final hasSeen = await localUserSettingsRepository.hasSeenWelcomeMessage(recipient.id);
      if (hasSeen) {
        // Clear it, or a later session that didn't log in would pick it up.
        await localUserSettingsRepository.setWelcomeMessagePending(pending: false);
        return;
      }
      if (!isClosed) emit(true);
    } on Exception catch (exception, stackTrace) {
      // Keep it hidden: if we can't read the flags, we can't tell a new login
      // from a recipient who was already logged in before this feature existed.
      await crashReportingRepository.logError(exception, stackTrace);
    }
  }

  Future<void> dismiss() async {
    // Hide immediately so the message can always be dismissed. If persisting
    // fails, the worst case is that it shows again on the next visit.
    emit(false);
    try {
      await localUserSettingsRepository.markWelcomeMessageSeen(recipient.id);
      await localUserSettingsRepository.setWelcomeMessagePending(pending: false);
    } on Exception catch (exception, stackTrace) {
      await crashReportingRepository.logError(exception, stackTrace);
    }
  }
}
