import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:flutter_bloc/flutter_bloc.dart";

/// State is whether the dashboard welcome message should be shown.
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
      final hasSeen = await localUserSettingsRepository.hasSeenWelcomeMessage(recipient.id);
      if (!isClosed) emit(!hasSeen);
    } on Exception catch (exception, stackTrace) {
      // Better to show the message again than to never show it.
      if (!isClosed) emit(true);
      await crashReportingRepository.logError(exception, stackTrace);
    }
  }

  Future<void> dismiss() async {
    // Hide immediately so the message can always be dismissed. If persisting
    // fails, the worst case is that it shows again on the next visit.
    emit(false);
    try {
      await localUserSettingsRepository.markWelcomeMessageSeen(recipient.id);
    } on Exception catch (exception, stackTrace) {
      await crashReportingRepository.logError(exception, stackTrace);
    }
  }
}
