import "package:alchemist/alchemist.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/model/currency.dart";
import "package:app/data/model/payout.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/view/widgets/income/income.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

import "../helpers/golden_test_device_scenario.dart";
import "../helpers/pump_app.dart";

void main() {
  late PaymentsCubit mockPaymentsCubit;

  setUp(() {
    mockPaymentsCubit = MockPaymentsCubit();
  });

  group("ListTile Golden Tests", () {
    goldenTest(
      "renders correctly",
      fileName: "balance_card_confirmed",
      pumpWidget: (tester, widget) {
        when(() => mockPaymentsCubit.state).thenReturn(
          PaymentsState(
            paymentsUiState: PaymentsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayment: const NextPaymentData(
                amount: 100,
                currency: Currency.sle,
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 2,
              unconfirmedPaymentsCount: 0,
              payments: [
                MappedPayment(
                  payment: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.confirmed,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPaymentsCubit);
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
        when(() => mockPaymentsCubit.state).thenReturn(
          PaymentsState(
            paymentsUiState: PaymentsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayment: const NextPaymentData(
                amount: 100,
                currency: Currency.sle,
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 1,
              payments: [
                MappedPayment(
                  payment: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.toReview,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPaymentsCubit);
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
        when(() => mockPaymentsCubit.state).thenReturn(
          PaymentsState(
            paymentsUiState: PaymentsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayment: const NextPaymentData(
                amount: 100,
                currency: Currency.sle,
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 1,
              payments: [
                MappedPayment(
                  payment: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPaymentsCubit);
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
        when(() => mockPaymentsCubit.state).thenReturn(
          PaymentsState(
            paymentsUiState: PaymentsUiState(
              status: BalanceCardStatus.onHold,
              nextPayment: const NextPaymentData(
                amount: 100,
                currency: Currency.sle,
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 3,
              payments: [
                MappedPayment(
                  payment: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 10).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 10).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.onHoldToReview,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 9).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 9).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.onHoldToReview,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "3",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "3",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.onHoldToReview,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "4",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "4",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPaymentsCubit);
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
        when(() => mockPaymentsCubit.state).thenReturn(
          PaymentsState(
            paymentsUiState: PaymentsUiState(
              status: BalanceCardStatus.allConfirmed,
              nextPayment: const NextPaymentData(
                amount: 100,
                currency: Currency.sle,
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 0,
              payments: [
                MappedPayment(
                  payment: Payout(
                    id: "1",
                    paymentAt: DateTime(2023, 10).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "1",
                    createdAt: DateTime(2023, 10).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "2",
                    paymentAt: DateTime(2023, 9).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "2",
                    createdAt: DateTime(2023, 9).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "3",
                    paymentAt: DateTime(2023, 8).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "3",
                    createdAt: DateTime(2023, 8).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: Payout(
                    id: "4",
                    paymentAt: DateTime(2023, 7).toIso8601String(),
                    amount: 100,
                    currency: Currency.sle,
                    status: PayoutStatus.confirmed,
                    recipientId: "4",
                    createdAt: DateTime(2023, 7).toIso8601String(),
                  ),
                  uiStatus: PaymentUiStatus.confirmed,
                ),
              ],
            ),
          ),
        );

        return tester.pumpApp(widget, paymentsCubit: mockPaymentsCubit);
      },
      builder: () => GoldenTestDeviceScenario(
        name: "confirmed and contested payments",
        builder: () => const BalanceCardContainer(),
      ),
    );
  });
}
