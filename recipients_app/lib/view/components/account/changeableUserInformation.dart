import 'package:app/models/currentUser.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

class ChangeableUserInformation extends StatelessWidget {
  final String section;

  const ChangeableUserInformation(this.section, {super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CurrentUser>(builder: (context, currentUser, child) {
      final bool birthDate = section == "Date of Birth";
      TextEditingController controller = TextEditingController(
          text: currentUser.changeableInformation(section));
      return Padding(
        padding: const EdgeInsets.only(top: 12.0),
        child: birthDate
            ? TextField(
                controller: controller,
                readOnly: birthDate,
                decoration: InputDecoration(
                    labelText: section,
                    enabledBorder: const OutlineInputBorder(
                        borderSide: BorderSide(width: 1.0))),
                onTap: () async {
                  if (birthDate) {
                    {
                      showDatePicker(
                        firstDate: DateTime(1950, 1, 1),
                        lastDate: DateTime(DateTime.now().year - 10),
                        initialDate: DateTime(2000, 1, 1),
                        context: context,
                      ).then((value) {
                        if (value != null) {
                          String birthDateString =
                              DateFormat('dd.MM.yyyy').format(value);
                          currentUser.updateBirthday(value);
                          controller.text = birthDateString;
                          print(controller.text);
                        }
                        return;
                      });
                    }
                  }
                })
            : TextFormField(
                initialValue: currentUser.changeableInformation(section),
                readOnly: birthDate,
                decoration: InputDecoration(
                    floatingLabelBehavior: FloatingLabelBehavior.auto,
                    labelText: section,
                    enabledBorder: const OutlineInputBorder(
                        borderSide: BorderSide(width: 1.0))),
                onChanged: (value) {
                  currentUser.updateBasicInfo(section, value);
                },
              ),
      );
    });
  }
}
