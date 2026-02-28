import "package:app/firebase_options_stage.dart";
import "package:app/main.dart";

Future<void> main() async {
  await runMainApp(DefaultFirebaseOptions.currentPlatform);
}
