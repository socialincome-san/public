import "package:app/models/current_user.dart";
import "package:app/models/social_income_transaction.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:provider/provider.dart";

class ReviewTransactionModal extends StatefulWidget {
  final SocialIncomeTransaction _transaction;

  const ReviewTransactionModal(this._transaction, {super.key});

  @override
  State<ReviewTransactionModal> createState() => _ReviewTransactionModalState();
}

class _ReviewTransactionModalState extends State<ReviewTransactionModal> {
  final List<String> _contestReasons = [
    "Phone stolen",
    "Incorrect amount",
    "Changed phone number",
    "Other reason"
  ];

  bool _contested = false;

  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(
      builder: (context, currentUser, child) {
        return Padding(
          padding: MediaQuery.of(context).viewInsets,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(top: 24, left: 8, right: 8),
                  child: Text(
                    _contested
                        ? "What happened?"
                        : "Have you received your Social Income?",
                    textScaleFactor: 1.3,
                  ),
                ),
              ),
              Padding(
                padding: AppSpacings.v16,
                child: _contested
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: _contestReasons.map((String reason) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: ElevatedButton(
                              onPressed: () {
                                final transactionId = widget._transaction.id;
                                if (transactionId != null) {
                                  currentUser.contestTransaction(
                                    transactionId,
                                    reason,
                                  );
                                }
                                Navigator.pop(context);
                              },
                              child: Text(reason),
                            ),
                          );
                        }).toList(),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          ElevatedButton(
                            onPressed: () {
                              final transactionId = widget._transaction.id;
                              if (transactionId != null) {
                                currentUser.confirmTransaction(transactionId);
                              }
                              Navigator.pop(context);
                            },
                            style: ButtonStyle(
                              minimumSize: MaterialStateProperty.all<Size>(
                                const Size(50, 50),
                              ),
                              backgroundColor: MaterialStateProperty.all<Color>(
                                AppColors.primaryColor,
                              ),
                            ),
                            child: const Text("YES"),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              setState(() {
                                _contested = true;
                              });
                            },
                            style: ButtonStyle(
                              minimumSize: MaterialStateProperty.all<Size>(
                                const Size(50, 50),
                              ),
                              backgroundColor: MaterialStateProperty.all<Color>(
                                Colors.red,
                              ),
                            ),
                            child: const Text("NO"),
                          ),
                        ],
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}
