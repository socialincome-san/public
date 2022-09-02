import firebase from "firebase/compat/app";
import { doc, setDoc } from "firebase/firestore";

export const populateOrganisationsCollection = async (firestore: firebase.firestore.Firestore) => {
  const organisations = {
    "test-organisation-1": {
      name: "Test Organisation 1",
    },
    "test-organisation-2": {
      name: "Test Organisation 2",
    },
  };

  for (const [documentId, organisation] of Object.entries(organisations)) {
    await setDoc(doc(firestore, "organisations", documentId), organisation);
  }
};
