import 'package:app/models/alertVisibility.dart';
import 'package:app/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SocialIncomeAlert extends StatelessWidget {
  final String message;
  final IconData icon;
  final String type;
  final String textButton;

  SocialIncomeAlert(this.message, this.icon, this.type, {this.textButton = ""});

  final TextStyle style = TextStyle(
    color: Colors.white,
    overflow: TextOverflow.clip,
    fontSize: 16,
  );

  final TextStyle buttonStyle = TextStyle(
    color: Colors.white,
    overflow: TextOverflow.clip,
    fontSize: 16,
    decoration: TextDecoration.underline,
  );

  @override
  Widget build(BuildContext context) {
    return Consumer<AlertVisibility>(
        builder: (context, alertVisibility, child) {
      return Container(
        padding: EdgeInsets.fromLTRB(20, 0, 20, 0),
        height: MediaQuery.of(context).size.height / 10,
        width: MediaQuery.of(context).size.width,
        color: siLightBlue,
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: Theme.of(context).primaryColor,
              child: IconButton(
                  onPressed: () {
                    alertVisibility.changeAlertVisibility(false, type);
                  },
                  icon: Icon(icon, color: Colors.white)),
            ),
            Flexible(
              child: TextButton(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(message, style: style),
                      Text(
                        textButton,
                        style: buttonStyle,
                      ),
                    ],
                  ),
                  onPressed: () {
                    alertVisibility.setContactVisibility(true);
                  }),
            ),
          ],
        ),
      );
    });
  }
}
