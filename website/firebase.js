import firebase from 'firebase/app'
import 'firebase/firestore'

const config = {
  apiKey: "THE_API_KEY",
  authDomain: "THE_AUTH_DOMAIN",
  databaseURL: "THE_DATABASE_URL",
  projectId: "THE_PROJECT_ID",
  storageBucket: "THE_STORAGE_BUCKET",
  messagingSenderId: "THE_MESSAGING_SENDER_ID",
  appId: "THE_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const db = firebase.firestore();

export default db;
