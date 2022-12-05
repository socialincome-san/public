import 'package:app/models/currentUser.dart';
import 'package:app/theme/theme.dart';
import 'package:app/view/components/income/BalanceCard.dart';
import 'package:app/view/components/income/TransactionCard.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class IncomePage extends StatelessWidget {
  const IncomePage({super.key});

  List<Widget> transactionCards(CurrentUser currentUser) {
    return {
      for (var transaction in currentUser.transactions ?? List.empty())
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: TransactionCard(transaction),
        )
    }.toList();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(builder: (context, currentUser, child) {
      return Padding(
          padding: edgeInsetsAll12,
          child: Column(children: [
            const Padding(
              padding: EdgeInsets.only(bottom: 8),
              child: BalanceCard(),
            ),
            transactionCards(currentUser).isEmpty
                ? const Expanded(
                    child: Center(
                      child: Text(
                          'All future Social Income payments will be shown on this screen.'),
                    ),
                  )
                : Expanded(
                    child: ListView(
                      children: transactionCards(currentUser),
                    ),
                  )
          ]));
    });
  }
}
