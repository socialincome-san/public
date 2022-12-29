import 'package:app/models/current_user.dart';
import 'package:app/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class UnchangeableUserInformation extends StatelessWidget {
  final String section;
  final String placeHolder;
  final TextEditingController controller = TextEditingController();

  UnchangeableUserInformation(this.section, this.placeHolder, {super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(builder: (context, currentUser, child) {
      return Container(
        constraints: const BoxConstraints(
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
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(6),
                    bottomLeft: Radius.circular(6),
                  ),
                  color: null,
                ),
                child: Text(
                  section,
                  style: Theme.of(context).textTheme.bodyText2?.copyWith(
                        color: siGreyText,
                      ),
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
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
