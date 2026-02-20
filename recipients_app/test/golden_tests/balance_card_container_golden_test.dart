import "package:alchemist/alchemist.dart";
import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/data/enums/balance_card_status.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/data/models/payment/next_payout_data.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/models/payment/payouts_ui_state.dart";
import "package:app/view/widgets/income/income.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

import "../helpers/golden_test_device_scenario.dart";
import "../helpers/pump_app.dart";

void main() {
  late PayoutsCubit mockPayoutsCubit;

  setUp(() {
    mockPayoutsCubit = MockPayoutsCubit();
  });

  group("ListTile Golden Tests", () {
    goldenTest(
      "renders correctly",
      fileName: "balance_card_confirmed",
      pumpWidget: (tester, widget) {
        when(() => mockPayoutsCubit.state).thenReturn(
          PayoutsState(
            payoutsUiState: PayoutsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayout: const NextPayoutData(
                amount: 100,
                currency: Currency.sle,
                daysToPayout: 10,
              ),
              confirmedPayoutsCount: 2,
              unconfirmedPayoutsCount: 0,
              payouts: [
                MappedPayout(
                  payout: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.confirmed,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPayoutsCubit);
      },
      builder: () => GoldenTestDeviceScenario(
        name: "only confirmed payments",
        builder: () => const BalanceCardContainer(),
      ),
    );

    goldenTest(
      "renders correctly",
      fileName: "balance_card_confirmed_and_paid",
      pumpWidget: (tester, widget) {
        when(() => mockPayoutsCubit.state).thenReturn(
          PayoutsState(
            payoutsUiState: PayoutsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayout: const NextPayoutData(
                amount: 100,
                currency: Currency.sle,
                daysToPayout: 10,
              ),
              confirmedPayoutsCount: 1,
              unconfirmedPayoutsCount: 1,
              payouts: [
                MappedPayout(
                  payout: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.toReview,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPayoutsCubit);
      },
      builder: () => GoldenTestDeviceScenario(
        name: "confirmed and in review payments",
        builder: () => const BalanceCardContainer(),
      ),
    );

    goldenTest(
      "renders correctly",
      fileName: "balance_card_confirmed_and_contested",
      pumpWidget: (tester, widget) {
        when(() => mockPayoutsCubit.state).thenReturn(
          PayoutsState(
            payoutsUiState: PayoutsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayout: const NextPayoutData(
                amount: 100,
                currency: Currency.sle,
                daysToPayout: 10,
              ),
              confirmedPayoutsCount: 1,
              unconfirmedPayoutsCount: 1,
              payouts: [
                MappedPayout(
                  payout: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.contested,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPayoutsCubit);
      },
      builder: () => GoldenTestDeviceScenario(
        name: "confirmed and contested payments",
        builder: () => const BalanceCardContainer(),
      ),
    );

    goldenTest(
      "renders correctly",
      fileName: "balance_card_confirmed_and_triple_inreview",
      pumpWidget: (tester, widget) {
        when(() => mockPayoutsCubit.state).thenReturn(
          PayoutsState(
            payoutsUiState: PayoutsUiState(
              status: BalanceCardStatus.onHold,
              nextPayout: const NextPayoutData(
                amount: 100,
                currency: Currency.sle,
                daysToPayout: 10,
              ),
              confirmedPayoutsCount: 1,
              unconfirmedPayoutsCount: 3,
              payouts: [
                MappedPayout(
                  payout: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 10).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 10).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.onHoldToReview,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 9).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 9).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.onHoldToReview,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "3",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "3",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.onHoldToReview,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "4",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "4",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPayoutsCubit);
      },
      builder: () => GoldenTestDeviceScenario(
        name: "confirmed and contested payments",
        builder: () => const BalanceCardContainer(),
      ),
    );

    goldenTest(
      "renders correctly",
      fileName: "balance_card_confirmed_and_triple_contested",
      pumpWidget: (tester, widget) {
        when(() => mockPayoutsCubit.state).thenReturn(
          PayoutsState(
            payoutsUiState: PayoutsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayout: const NextPayoutData(
                amount: 100,
                currency: Currency.sle,
                daysToPayout: 10,
              ),
              confirmedPayoutsCount: 1,
              unconfirmedPayoutsCount: 0,
              payouts: [
                MappedPayout(
                  payout: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 10).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 10).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.contested,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 9).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 9).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.contested,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "3",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "3",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.contested,
                ),
                MappedPayout(
                  payout: Payout(
                    id: "4",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "4",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PayoutUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPayoutsCubit);
      },
      builder: () => GoldenTestDeviceScenario(
        name: "confirmed and contested payments",
        builder: () => const BalanceCardContainer(),
      ),
    );
  });
}
