import 'package:app/models/currentUser.dart';
import 'package:app/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class UnchangableUserInformation extends StatelessWidget {
  final String section;
  final String placeHolder;
  final TextEditingController controller = TextEditingController();

  UnchangableUserInformation(this.section, this.placeHolder);

  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(builder: (context, currentUser, child) {
      return Container(
        constraints: BoxConstraints(
          maxHeight: 39,
          minHeight: 39,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Expanded(
              flex: 3,
              child: Container(
                padding: edgeInsetsAll12,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(6),
                    bottomLeft: Radius.circular(6),
                  ),
                  color: null,
                ),
                child: Text(
                  section,
                  style: Theme.of(context).textTheme.bodyText2.copyWith(
                        color: siGreyText,
                      ),
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topRight: Radius.circular(6),
                    bottomRight: Radius.circular(6),
                  ),
                  color: null,
                ),
                child: Text(placeHolder),
              ),
            ),
          ],
        ),
      );
    });
  }
}
