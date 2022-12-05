import 'package:flutter/material.dart';

class TempWidgetHolder extends StatelessWidget {
  final Widget content;
  const TempWidgetHolder(this.content);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text("testing"),
        backgroundColor: Colors.red,
      ),
      backgroundColor: const Color(0xFFEDF3FF),
      body: content,
    );
  }
}
