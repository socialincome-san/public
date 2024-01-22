import "package:alchemist/alchemist.dart";
import "package:flutter/material.dart";

import "device.dart";

/// Wrapper for testing widgets (primarily screens) with device constraints
class GoldenTestDeviceScenario extends StatelessWidget {
  final String name;
  final Device device;
  final ValueGetter<Widget> builder;

  const GoldenTestDeviceScenario({
    required this.name,
    required this.builder,
    this.device = Device.iphone11,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GoldenTestScenario(
      name: "$name (device: ${device.name})",
      constraints: BoxConstraints.tight(device.size),
      child: ClipRect(
        child: MediaQuery(
          data: MediaQuery.of(context).copyWith(
            size: device.size,
            padding: device.safeArea,
            platformBrightness: device.brightness, 
            textScaler: TextScaler.linear(device.textScaleFactor),
            devicePixelRatio: device.devicePixelRatio,
          ),
          child: SizedBox(
            height: device.size.height,
            width: device.size.width,
            child: builder(),
          ),
        ),
      ),
    );
  }
}
