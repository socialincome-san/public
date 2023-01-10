import "dart:developer";

import "package:app/models/current_user.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";
import "package:provider/provider.dart";

class ChangeableUserInformation extends StatelessWidget {
  final String section;

  const ChangeableUserInformation(this.section, {super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(
      builder: (context, currentUser, child) {
        final bool birthDate = section == "Date of Birth";
        final TextEditingController controller = TextEditingController(
          text: currentUser.changeableInformation(section),
        );
        return Padding(
          padding: const EdgeInsets.only(top: 12.0),
          child: birthDate
              ? TextField(
                  controller: controller,
                  readOnly: birthDate,
                  decoration: InputDecoration(
                    labelText: section,
                    enabledBorder: const OutlineInputBorder(),
                  ),
                  onTap: () async {
                    if (birthDate) {
                      {
                        showDatePicker(
                          firstDate: DateTime(1950),
                          lastDate: DateTime(DateTime.now().year - 10),
                          initialDate: DateTime(2000),
                          context: context,
                        ).then((value) {
                          if (value != null) {
                            final String birthDateString =
                                DateFormat("dd.MM.yyyy").format(value);
                            currentUser.updateBirthday(value);
                            controller.text = birthDateString;
                            log(controller.text);
                          }
                          return;
                        });
                      }
                    }
                  },
                )
              : TextFormField(
                  initialValue: currentUser.changeableInformation(section),
                  readOnly: birthDate,
                  decoration: InputDecoration(
                    floatingLabelBehavior: FloatingLabelBehavior.auto,
                    labelText: section,
                    enabledBorder: const OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    currentUser.updateBasicInfo(section, value);
                  },
                ),
        );
      },
    );
  }
}
