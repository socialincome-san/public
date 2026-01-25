import "dart:async";

import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/view/widgets/account/dashboard_card.dart";
import "package:dart_mappable/dart_mappable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "dashboard_card_manager_cubit.mapper.dart";
part "dashboard_card_manager_state.dart";

class DashboardCardManagerCubit extends Cubit<DashboardCardManagerState> {
  final UserRepository userRepository;
  final CrashReportingRepository crashReportingRepository;

  DashboardCardManagerCubit({
    required this.userRepository,
    required this.crashReportingRepository,
  }) : super(const DashboardCardManagerState());

  Future<void> fetchCards() async {
    emit(state.copyWith(status: DashboardCardManagerStatus.loading));

    final recipient = userRepository.currentRecipient;

    if (recipient == null) return;

    final List<DashboardCard> cards = [];

    try {
      // TODO(dev): currently payment phone number is used for login, we need to switch that
      // TODO(migration): unclear what the comment above means :D
      final contactPhoneNumber = recipient.contact.phone?.number;
      final paymentPhoneNumber = recipient.paymentInformation?.phone.number;

      // TODO(migration): clarify logic here. If we want to set the contact phone number as payment phone number we 
      // also need to set the payment provider (API enforces that). How do we get that info from the user?
      if (paymentPhoneNumber == null && contactPhoneNumber != null) {
        final paymentPhoneCard = DashboardCard(
          title: "My Profile",
          message: "Is your contact phone number ($contactPhoneNumber) also your payment phone number?",
          primaryButtonText: "Yes",
          secondaryButtonText: "No",
          type: DashboardCardType.paymentNumberEqualsContactNumber,
        );

        cards.add(paymentPhoneCard);
      }

      if (contactPhoneNumber == null && paymentPhoneNumber != null) {
        final contactPhoneCard = DashboardCard(
          title: "My Profile",
          message: "Is your payment phone number ($paymentPhoneNumber) also your contact phone number?",
          primaryButtonText: "Yes",
          secondaryButtonText: "No",
          type: DashboardCardType.contactNumberEqualsPaymentNumber,
        );

        cards.add(contactPhoneCard);
      }

      emit(
        state.copyWith(
          status: DashboardCardManagerStatus.loaded,
          cards: cards,
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(status: DashboardCardManagerStatus.error, exception: ex),
      );
    }
  }

  Future<void> updatePaymentNumber() async {
    emit(state.copyWith(status: DashboardCardManagerStatus.updating));

    try {
      final recipient = userRepository.currentRecipient;

      if (recipient == null) throw Exception("Recipient not found");

      await userRepository.updateRecipient(
        RecipientSelfUpdate(
          paymentPhone: recipient.contact.phone?.number,
          // TODO: We need to handle a missing provider info in the UI before this can work properly
          paymentProvider: recipient.paymentInformation?.provider,
        ),
      );

      emit(state.copyWith(status: DashboardCardManagerStatus.updated));
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: DashboardCardManagerStatus.error,
          exception: ex,
        ),
      );
    }
  }

  Future<void> updateContactNumber() async {
    emit(state.copyWith(status: DashboardCardManagerStatus.updating));

    try {
      final recipient = userRepository.currentRecipient;

      if (recipient == null) throw Exception("Recipient not found");

      await userRepository.updateRecipient(
        RecipientSelfUpdate(contactPhone: recipient.paymentInformation?.phone.number),
      );

      emit(state.copyWith(status: DashboardCardManagerStatus.updated));
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: DashboardCardManagerStatus.error,
          exception: ex,
        ),
      );
    }
  }
}
