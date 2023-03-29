import "package:app/core/helpers/custom_bloc_observer.dart";
import "package:app/my_app.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:firebase_core/firebase_core.dart";
import "package:firebase_crashlytics/firebase_crashlytics.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_bloc/flutter_bloc.dart";

//Async for Firebase
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations(
    [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown],
  );
  await Firebase.initializeApp();

  final firestore = FirebaseFirestore.instance;
  final firebaseAuth = FirebaseAuth.instance;
  final crashlytics = FirebaseCrashlytics.instance;

  firestore.useFirestoreEmulator("localhost", 8080);
  firebaseAuth.useAuthEmulator("localhost", 9099);
  firebaseAuth.setSettings(appVerificationDisabledForTesting: true);

  FlutterError.onError = crashlytics.recordFlutterFatalError;
  PlatformDispatcher.instance.onError = (error, stack) {
    crashlytics.recordError(error, stack, fatal: true);
    return true;
  };

  Bloc.observer = CustomBlocObserver();

  runApp(
    MyApp(
      firebaseAuth: firebaseAuth,
      firestore: firestore,
      crashlytics: crashlytics,
    ),
  );
}
