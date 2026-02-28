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
      // INFO: Currently the payment phone number is used for phone authentication, too. 
      // In the backend the payment phone number must be the same as the Firebase auth phome number.
      // That's why at the moment the payment phone number can not be changed by the mobile app user.
      final contactPhoneNumber = recipient.contact.phone?.number;
      final paymentPhoneNumber = recipient.paymentInformation?.phone.number;

      // TODO(migration): Clarify logic here. Given the info above, do we even have a scenario where the payment phone number is null? 
      // If not, we can simplify this logic and just ask "Is your contact phone number the same as your payment phone number?" 
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
        ),
      );

      emit(state.copyWith(status: DashboardCardManagerStatus.updated, cards: []));
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

      emit(state.copyWith(status: DashboardCardManagerStatus.updated, cards: []));
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
