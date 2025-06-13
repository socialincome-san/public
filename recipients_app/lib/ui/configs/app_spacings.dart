import "package:flutter/material.dart";

abstract class AppSpacings {
  const AppSpacings._();

  static const EdgeInsets a4 = EdgeInsets.all(4);
  static const EdgeInsets a8 = EdgeInsets.all(8);
  static const EdgeInsets a12 = EdgeInsets.all(12);
  static const EdgeInsets a16 = EdgeInsets.all(16);

  static const EdgeInsets h8 = EdgeInsets.symmetric(horizontal: 8);
  static const EdgeInsets h16 = EdgeInsets.symmetric(horizontal: 16);

  static const EdgeInsets v8 = EdgeInsets.symmetric(vertical: 8);
  static const EdgeInsets v16 = EdgeInsets.symmetric(vertical: 16);

  static const EdgeInsets h8v4 = EdgeInsets.symmetric(horizontal: 8, vertical: 4);
  static const EdgeInsets h16v8 = EdgeInsets.symmetric(horizontal: 16, vertical: 8);
  static const EdgeInsets h12v16 = EdgeInsets.symmetric(horizontal: 12, vertical: 16);
}
