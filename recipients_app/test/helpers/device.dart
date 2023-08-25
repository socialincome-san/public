// Copied and adapted from https://github.com/eBay/flutter_glove_box/blob/master/packages/golden_toolkit/lib/src/device.dart

import "package:flutter/material.dart";

/// This [Device] is a configuration for golden test.
class Device {
  /// This [Device] is a configuration for golden test.
  const Device({
    required this.size,
    required this.name,
    this.devicePixelRatio = 1.0,
    this.textScaleFactor = 1.0,
    this.brightness = Brightness.light,
    this.safeArea = EdgeInsets.zero,
  });

  // from here: https://medium.com/@mregnauld/generate-screenshots-for-a-flutter-app-with-golden-testing-and-upload-them-to-the-stores-1-2-45f8df777aef

  /// Android smartphone: 1107 x 1968 (density: 3)
  static const Device storeAndroidPhone = Device(
    name: "",
    size: Size(1107 / 2, 1968 / 2),
    devicePixelRatio: 2,
    safeArea: EdgeInsets.only(top: 24, bottom: 20),
  );

  /// 7 inches Android tablet: 1206 x 2144 (density: 2)
  static const Device storeAndroidTablet7 = Device(
    name: "android_tablet_7",
    size: Size(1206 / 2, 2144 / 2),
    devicePixelRatio: 2,
    safeArea: EdgeInsets.only(top: 24, bottom: 20),
  );

  /// 10 inches Android tablet: 1449 x 2576 (density: 2)
  static const Device storeAndroidTablet10 = Device(
    name: "android_tablett_10",
    size: Size(1449 / 2, 2576 / 2),
    devicePixelRatio: 2,
    safeArea: EdgeInsets.only(top: 24, bottom: 20),
  );

  /// iPad pro 2nd gen: 2048 x 2732 (density: 2)
  /// iPad pro 6th gen: 2048 x 2732 (density: 2)
  static const Device storeIpad2ndGen = Device(
    name: "ipad_2nd_gen",
    size: Size(2048 / 2, 2732 / 2),
    devicePixelRatio: 2,
    safeArea: EdgeInsets.only(top: 24, bottom: 20),
  );

  /// iPhone 8 Plus: 1242 x 2208 (density: 3)
  static const Device storeIphone8Plus = Device(
    name: "iphone_8_plus",
    size: Size(1242 / 3, 2208 / 3),
    devicePixelRatio: 3,
    safeArea: EdgeInsets.only(top: 24, bottom: 20),
  );

  /// Android smartphone: 1107 x 1968 (density: 3)
  static const Device storeIphoneXSMax = Device(
    name: "iphone_xs_max",
    size: Size(1242 / 3, 2688 / 3),
    devicePixelRatio: 3,
    safeArea: EdgeInsets.only(top: 24, bottom: 20),
  );

  /// [smallPhone] one of the smallest phone screens
  static const Device smallPhone =
      Device(name: "small_phone", size: Size(375, 667));

  /// [iphone11] matches specs of iphone11, but with lower DPI for performance
  static const Device iphone11 = Device(
    name: "iphone11",
    size: Size(414, 896),
    safeArea: EdgeInsets.only(top: 44, bottom: 34),
  );

  static const Device iphone11Landscape = Device(
    name: "iphone11_landscape",
    size: Size(896, 414),
    safeArea: EdgeInsets.only(left: 44, right: 34),
  );

  /// [tabletLandscape] example of tablet that in landscape mode
  static const Device tabletLandscape =
      Device(name: "tablet_landscape", size: Size(1366, 1024));

  /// [tabletPortrait] example of tablet that in portrait mode
  static const Device tabletPortrait =
      Device(name: "tablet_portrait", size: Size(1024, 1366));

  /// [name] specify device name. Ex: Phone, Tablet, Watch
  final String name;

  /// [size] specify device screen size. Ex: Size(1366, 1024))
  final Size size;

  /// [devicePixelRatio] specify device Pixel Ratio
  final double devicePixelRatio;

  /// [textScaleFactor] specify custom text scale factor
  final double textScaleFactor;

  /// [brightness] specify platform brightness
  final Brightness brightness;

  /// [safeArea] specify insets to define a safe area
  final EdgeInsets safeArea;

  /// [copyWith] convenience function for [Device] modification
  Device copyWith({
    Size? size,
    double? devicePixelRatio,
    String? name,
    Brightness? brightness,
    EdgeInsets? safeArea,
    double? textScaleFactor,
  }) {
    return Device(
      size: size ?? this.size,
      devicePixelRatio: devicePixelRatio ?? this.devicePixelRatio,
      name: name ?? this.name,
      textScaleFactor: textScaleFactor ?? this.textScaleFactor,
      brightness: brightness ?? this.brightness,
      safeArea: safeArea ?? this.safeArea,
    );
  }

  /// [dark] convenience method to copy the current device and apply dark theme
  Device dark() {
    return Device(
      size: size,
      devicePixelRatio: devicePixelRatio,
      textScaleFactor: textScaleFactor,
      brightness: Brightness.dark,
      safeArea: safeArea,
      name: "${name}_dark",
    );
  }

  @override
  String toString() {
    return "Device: $name, "
        "${size.width}x${size.height} @ $devicePixelRatio, "
        "text: $textScaleFactor, $brightness, safe: $safeArea";
  }
}
