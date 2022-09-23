import { getFirestore, DocumentData, CollectionReference, DocumentReference } from 'firebase-admin/firestore';
import * as firebase from 'firebase-admin';

export const firebaseApp = firebase.initializeApp();

/**
 * direct access to the admin firestore instance. Deployed, this has full admin access to the data.
 */
export const firestore = getFirestore();

/**
 * Access the typed collection
 */
export const createCollection = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
	return firestore.collection(collectionName) as CollectionReference<T>;
};

/**
 * Access the typed document of a collection
 */
export const createDoc = <T = DocumentData>(collectionName: string, docId: string): DocumentReference<T> => {
	return createCollection<T>(collectionName).doc(docId);
};
