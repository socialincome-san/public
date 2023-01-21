import "package:app/my_app.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:firebase_core/firebase_core.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";

//Async for Firebase
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations(
    [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown],
  );
  await Firebase.initializeApp();

  FirebaseFirestore.instance.useFirestoreEmulator("localhost", 8080);
  FirebaseAuth.instance.useAuthEmulator("localhost", 9099);
  FirebaseAuth.instance.setSettings(appVerificationDisabledForTesting: true);

  final firestore = FirebaseFirestore.instance;
  final firebaseAuth = FirebaseAuth.instance;

  runApp(
    MyApp(
      firebaseAuth: firebaseAuth,
      firestore: firestore,
    ),
  );
}
