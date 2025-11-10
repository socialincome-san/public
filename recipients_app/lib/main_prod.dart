import "package:app/firebase_options_prod.dart";
import "package:app/main.dart";

void main() async {
  await runMainApp(DefaultFirebaseOptions.currentPlatform);
}
