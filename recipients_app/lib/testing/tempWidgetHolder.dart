import 'package:flutter/material.dart';

class TempWidgetHolder extends StatelessWidget {
  final Widget content;
  TempWidgetHolder(this.content);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text("testing"),
        backgroundColor: Colors.red,
      ),
      backgroundColor: Color(0xFFEDF3FF),
      body: content,
    );
  }
}
