import { initializeApp } from 'firebase-admin/app';
import { CollectionReference, DocumentData, DocumentReference, getFirestore } from 'firebase-admin/firestore';

initializeApp();

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
