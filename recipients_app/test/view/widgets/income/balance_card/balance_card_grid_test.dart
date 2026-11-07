import "package:app/view/widgets/income/balance_card/balance_card_grid.dart";
import "package:flutter/material.dart";
import "package:flutter_test/flutter_test.dart";

void main() {
  for (final (paymentCount, expectedRowSizes) in [
    (6, [6]),
    (9, [5, 4]),
    (14, [7, 7]),
    (36, [8, 7, 7, 7, 7]),
    (60, [8, 8, 8, 8, 7, 7, 7, 7]),
  ]) {
    testWidgets(
      "distributes $paymentCount payments evenly across rows of at most 8",
      (tester) async {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: BalanceCardGrid(
                payments: const [],
                programTotalCountOfPayments: paymentCount,
              ),
            ),
          ),
        );

        final rows = tester.widgetList<Row>(
          find.descendant(
            of: find.byType(LayoutBuilder),
            matching: find.byType(Row),
          ),
        );
        expect(rows.map((row) => row.children.length), expectedRowSizes);
      },
    );
  }
}
