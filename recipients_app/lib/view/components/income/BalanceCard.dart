import 'package:app/models/currentUser.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class BalanceCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(builder: (context, currentUser, child) {
      return Container(
        color: Colors.white,
        height: MediaQuery.of(context).size.height / 5,
        width: MediaQuery.of(context).size.height * .9,
        padding: EdgeInsets.all(6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            Text(
              "Social Income received so far",
              style: TextStyle(
                fontSize: 20.0,
              ),
            ),
            Text(
              " SLE " + currentUser.totalIncome().toString(),
              style: TextStyle(
                  color: Colors.black,
                  fontSize: 36.0,
                  fontWeight: FontWeight.w500),
            ),
          ],
        ),
      );
    });
  }
}
