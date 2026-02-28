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
      // HINT: Currently the payment phone number can not be empty. 
      // Current backend behaviour:
      // If you change the payment number this triggers the deletion of the firebase auth user and the creation of a new one with the new phone number.
      // That means the payment number is always the same as the firebase auth phone number and so it can not be null.
      final contactPhoneNumber = recipient.contact.phone?.number;
      final paymentPhoneNumber = recipient.paymentInformation?.phone.number;

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
