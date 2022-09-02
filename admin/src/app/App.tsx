import { Authenticator, EntityCollection, FirebaseCMSApp, User } from "@camberi/firecms";
import React, { useState } from "react";
import { adminsCollection } from "./collections/admins/collections";
// import { contributionsCollection } from "./collections/contributions/collections";
import { operationalExpensesCollection } from "./collections/operational_expenses/collections";
import { AdminUser } from "./collections/admins/interface";
import { buildRecipientsCollection, buildRecentPaymentsCollection } from "./collections/recipients/collections";
import { buildOrganisationsCollection } from "./collections/organisations/collections";
// import { paymentsCollection } from "./collections/payments/collections";
import { usersCollection } from "./collections/users/collections";
import { newsletterSubscribersCollection } from "./collections/newsletter_subscribers/collections";
import { organisationsContributorsCollection } from "./collections/organisations_contributors/collections";
import { orangeMoneyCollection } from "./collections/om-list/collection";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

import {
  FB_API_KEY,
  FB_AUTH_DOMAIN,
  FB_DATABASE_URL,
  FB_MESSAGING_SENDER_ID,
  FB_PROJECT_ID,
  FB_STORAGE_BUCKET,
  FB_MEASUREMENT_ID,
  FB_AUTH_EMULATOR_URL,
  FB_STORAGE_EMULATOR_HOST,
  FB_STORAGE_EMULATOR_PORT,
  FB_FIRESTORE_EMULATOR_HOST,
  FB_FIRESTORE_EMULATOR_PORT,
} from "./config";

const firebaseConfig = {
  apiKey: FB_API_KEY,
  authDomain: FB_AUTH_DOMAIN,
  databaseURL: FB_DATABASE_URL,
  projectId: FB_PROJECT_ID,
  storageBucket: FB_STORAGE_BUCKET,
  messagingSenderId: FB_MESSAGING_SENDER_ID,
  measurementId: FB_MEASUREMENT_ID,
};

const onFirebaseInit = () => {
  if (FB_AUTH_EMULATOR_URL) {
    connectAuthEmulator(getAuth(), FB_AUTH_EMULATOR_URL);
    console.log("Using auth emulator");
  } else {
    console.log("Using production auth");
  }
  if (FB_FIRESTORE_EMULATOR_HOST && FB_FIRESTORE_EMULATOR_PORT) {
    connectFirestoreEmulator(getFirestore(), FB_FIRESTORE_EMULATOR_HOST, +FB_FIRESTORE_EMULATOR_PORT);
    console.log(FB_FIRESTORE_EMULATOR_PORT);
    console.log("Using firestore emulator");
  } else {
    console.log("Using production firestore");
  }

  if (FB_STORAGE_EMULATOR_HOST && FB_STORAGE_EMULATOR_PORT) {
    connectStorageEmulator(getStorage(), FB_STORAGE_EMULATOR_HOST, +FB_STORAGE_EMULATOR_PORT);
    console.log("Using storage emulator");
  } else {
    console.log("Using production stroage");
  }
};

export default function App() {
  const globalAdminCollections = [
    adminsCollection,
    // contributionsCollection,
    operationalExpensesCollection,
    newsletterSubscribersCollection,
    organisationsContributorsCollection,
    // paymentsCollection,
    orangeMoneyCollection,
    usersCollection,
    buildOrganisationsCollection({ isGlobalAdmin: true }),
    buildRecipientsCollection({ isGlobalAdmin: true }),
    buildRecentPaymentsCollection({ isGlobalAdmin: true }),
  ];

  // The initialFilter property on collections is static, i.e. we can't dynamically access user information when we create
  // the filter, which is why we need to first fetch user information before we create the entire collection. This way,
  // we can set the filter based on the user's permission.
  const [collections, setCollections] = useState<EntityCollection[]>([]);
  const myAuthenticator: Authenticator<User> = async ({ user, dataSource }) => {
    dataSource
      .fetchEntity<AdminUser>({
        path: adminsCollection.path,
        collection: adminsCollection,
        entityId: user?.email ? user.email : "",
      })
      .then((result) => {
        if (collections.length === 0) {
          // We only want this to update once on initial page load
          if (result?.values?.is_global_admin) {
            setCollections(globalAdminCollections);
          } else {
            setCollections([
              buildOrganisationsCollection({ isGlobalAdmin: false }),
              buildRecipientsCollection({ isGlobalAdmin: false, organisations: result?.values?.organisations }),
              buildRecentPaymentsCollection({ isGlobalAdmin: false }),
            ]);
          }
        }
      });
    return true;
  };

  return (
    <FirebaseCMSApp
      name={"Social Income Admin"}
      logo={"logo.svg"}
      signInOptions={["google.com", "password"]}
      // LoginView={(props: FirebaseLoginViewProps) => <FirebaseLoginView {...props} allowSkipLogin={true} />}
      collections={collections}
      authentication={myAuthenticator}
      locale={"enUS"}
      firebaseConfig={firebaseConfig}
      onFirebaseInit={onFirebaseInit}
      dateTimeFormat={"yyyy-MM-dd"}
    />
  );
}
