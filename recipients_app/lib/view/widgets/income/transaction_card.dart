import "package:app/data/models/social_income_transaction.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/review_transaction_modal.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";

String format = ",###,###";
NumberFormat f = NumberFormat(format, "en_US");

class TransactionCard extends StatelessWidget {
  final SocialIncomeTransaction transaction;

  const TransactionCard({
    required this.transaction,
    super.key,
  });

  String cleanStatus(String? currentStatus) {
    return currentStatus != null &&
            ["contested", "confirmed"].contains(currentStatus)
        ? currentStatus
        : "please review this transaction";
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.15,
      color: Colors.white,
      child: Row(
        children: [
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: AppSpacings.h8,
                  child: Text(
                    "${transaction.currency} ${f.format(transaction.amount)}",
                    textScaleFactor: 1.5,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 8.0, left: 8.0),
                  child: Text(getTransactionStatusText()),
                ),
                if (transaction.status == "contested")
                  const Padding(
                    padding: EdgeInsets.only(left: 8.0),
                    child: Text(
                      "We will reach out to you soon",
                      style: TextStyle(fontStyle: FontStyle.italic),
                    ),
                  )
              ],
            ),
          ),
          if (transaction.status != "confirmed")
            Padding(
              padding: AppSpacings.a16,
              child: ElevatedButton(
                style: ButtonStyle(
                  minimumSize:
                      MaterialStateProperty.all<Size>(const Size(60, 50)),
                ),
                onPressed: () {
                  showModalBottomSheet(
                    isScrollControlled: true,
                    context: context,
                    builder: (context) {
                      return ReviewTransactionModal(transaction);
                    },
                  );
                },
                child: const Text("Review"),
              ),
            )
        ],
      ),
    );
  }

  String getTransactionStatusText() {
    final confirmedAt = transaction.confirmedAt;
    return cleanStatus(transaction.status) +
        (transaction.status == "confirmed" && confirmedAt != null
            ? " at ${DateFormat("dd.MM.yyyy").format(confirmedAt.toDate())}"
            : "");
  }
}
