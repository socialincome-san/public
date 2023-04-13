import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/dashboard_card.dart";
import "package:app/data/repositories/repositories.dart";
import "package:bloc/bloc.dart";
import "package:equatable/equatable.dart";

part "dashboard_card_manager_state.dart";

class DashboardCardManagerCubit extends Cubit<DashboardCardManagerState> {
  final AuthCubit authCubit;
  final CrashReportingRepository crashReportingRepository;

  DashboardCardManagerCubit({
    required this.authCubit,
    required this.crashReportingRepository,
  }) : super(const DashboardCardManagerState()) {
    authCubit.stream.listen((event) {
      fetchCards();
    });
  }

  Future<void> fetchCards() async {
    emit(state.copyWith(status: DashboardCardManagerStatus.loading));
    final recipient = authCubit.state.recipient;

    if (recipient == null) return;

    List<DashboardCard> cards = [];

    try {
      // TODO: currently payment phone number is used for login, we need to switch that

      final paymentPhoneNumber = recipient.mobileMoneyPhone;
      final contactPhoneNumber = recipient.communicationMobilePhone;

      if (paymentPhoneNumber == null && contactPhoneNumber != null) {
        final paymentPhoneCard = DashboardCard(
          title: "My Profile",
          message:
              "Is your contact phone number (${contactPhoneNumber.phoneNumber}) also your payment phone number?",
          primaryButtonText: "Yes",
          secondaryButtonText: "No",
          type: DashboardCardType.paymentNumberEqualsContactNumber,
        );

        cards.add(paymentPhoneCard);
      }

      if (contactPhoneNumber == null && paymentPhoneNumber != null) {
        final contactPhoneCard = DashboardCard(
          title: "My Profile",
          message:
              "Is your payment phone number (${paymentPhoneNumber.phoneNumber}) also your contact phone number?",
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
    final recipient = authCubit.state.recipient!;
    await authCubit.updateRecipient(
      recipient.copyWith(
        mobileMoneyPhone: recipient.communicationMobilePhone,
      ),
    );
  }

  Future<void> updateContactNumber() async {
    final recipient = authCubit.state.recipient!;
    await authCubit.updateRecipient(
      recipient.copyWith(
        communicationMobilePhone: recipient.mobileMoneyPhone,
      ),
    );
  }
}
