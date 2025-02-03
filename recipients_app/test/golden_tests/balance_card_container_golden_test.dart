import "package:alchemist/alchemist.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/view/widgets/income/income.dart";
import "package:cloud_firestore/cloud_firestore.dart";
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
                currency: "SLE",
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 2,
              unconfirmedPaymentsCount: 0,
              payments: [
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "1",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 7)),
                  ),
                  uiStatus: PaymentUiStatus.confirmed,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "2",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 8)),
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
                currency: "SLE",
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 1,
              payments: [
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "2",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 8)),
                  ),
                  uiStatus: PaymentUiStatus.toReview,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "1",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 7)),
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
                currency: "SLE",
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 1,
              payments: [
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "2",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 8)),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "1",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 7)),
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
                currency: "SLE",
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 3,
              payments: [
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "1",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 10)),
                  ),
                  uiStatus: PaymentUiStatus.onHoldToReview,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "2",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 9)),
                  ),
                  uiStatus: PaymentUiStatus.onHoldToReview,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "3",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 8)),
                  ),
                  uiStatus: PaymentUiStatus.onHoldToReview,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "4",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 7)),
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
                currency: "SLE",
                daysToPayment: 10,
              ),
              confirmedPaymentsCount: 1,
              unconfirmedPaymentsCount: 0,
              payments: [
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "1",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 10)),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "2",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 9)),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "3",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 8)),
                  ),
                  uiStatus: PaymentUiStatus.contested,
                ),
                MappedPayment(
                  payment: SocialIncomePayment(
                    id: "4",
                    paymentAt: Timestamp.fromDate(DateTime(2023, 7)),
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
