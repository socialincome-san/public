import { CollectionReference, DocumentData, DocumentReference, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as admin from 'firebase-admin';

/**
 * direct access to the admin storage instance. Deployed, this has full admin access to the data.
 */

export const app = initializeApp({
	storageBucket: process.env.FB_STORAGE_BUCKET,
	credential: admin.credential.applicationDefault()
});

/**
 * direct access to the admin firestore instance. Deployed, this has full admin access to the data.
 */
export const firestore = getFirestore();

/**
 * direct access to the admin firestore instance. Deployed, this has full admin access to the data.
 */
 export const storage = getStorage();


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
