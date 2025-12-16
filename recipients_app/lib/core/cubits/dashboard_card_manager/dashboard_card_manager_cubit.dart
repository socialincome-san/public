import "dart:async";

import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/view/widgets/account/dashboard_card.dart";
import "package:dart_mappable/dart_mappable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "dashboard_card_manager_cubit.mapper.dart";
part "dashboard_card_manager_state.dart";

class DashboardCardManagerCubit extends Cubit<DashboardCardManagerState> {
  final AuthCubit authCubit;
  final CrashReportingRepository crashReportingRepository;
  late StreamSubscription<AuthState> authSubscription;

  DashboardCardManagerCubit({
    required this.authCubit,
    required this.crashReportingRepository,
  }) : super(const DashboardCardManagerState()) {
    authSubscription = authCubit.stream.listen((event) {
      fetchCards();
    });
  }

  @override
  Future<void> close() async {
    authSubscription.cancel();
    super.close();
  }

  Future<void> fetchCards() async {
    emit(state.copyWith(status: DashboardCardManagerStatus.loading));
    final recipient = authCubit.state.recipient;

    if (recipient == null) return;

    final List<DashboardCard> cards = [];

    try {
      // TODO(dev): currently payment phone number is used for login, we need to switch that
      // TODO(migration): unclear what the comment above means :D
      // final paymentPhoneNumber = recipient.mobileMoneyPhone;
      // final contactPhoneNumber = recipient.communicationMobilePhone;

      final contactPhoneNumber = recipient.contact.phone?.number;
      final paymentPhoneNumber = recipient.paymentInformation?.phone.number;

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
    // TODO(Dev): implement this with new PhoneNumber type
    /* final recipient = authCubit.state.recipient!;
    await authCubit.updateRecipient(
      mobileMoneyPhone: recipient.communicationMobilePhone,
    ); */
  }

  Future<void> updateContactNumber() async {
    // TODO(Dev): implement this with new PhoneNumber type
    /* final recipient = authCubit.state.recipient!;
    await authCubit.updateRecipient(
      communicationMobilePhone: recipient.mobileMoneyPhone,
    ); */
  }
}
