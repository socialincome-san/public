import { initializeApp } from 'firebase-admin/app';
import {
	CollectionReference,
	DocumentData,
	DocumentReference,
	getFirestore,
	Query,
	QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

initializeApp();

/**
 * direct access to the admin firestore instance. Deployed, this has full admin access to the data.
 */
export const firestore = getFirestore();

/**
 * Access the typed collection
 */
export const collection = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
	return firestore.collection(collectionName) as CollectionReference<T>;
};

/**
 * Access the typed document of a collection
 */
export const doc = <T = DocumentData>(collectionName: string, docId: string): DocumentReference<T> => {
	return collection<T>(collectionName).doc(docId);
};

/**
 * Find the first document meeting the provided query
 */
export const findFirst = async <T = DocumentData>(
	collectionName: string,
	query: (col: CollectionReference<T>) => Query<T>
): Promise<QueryDocumentSnapshot<T> | undefined> => {
	const snapshot = await query(collection<T>(collectionName)).get();
	return snapshot.docs.at(0);
};
