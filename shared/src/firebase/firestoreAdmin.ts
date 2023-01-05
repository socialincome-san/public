import assert from 'assert';
import {
	CollectionReference,
	DocumentData,
	DocumentReference,
	getFirestore,
	Query,
	QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { AdminUser } from '../types';
import { getOrInitializeApp } from './app';

/**
 * direct access to the admin firestore instance. Deployed, this has full admin access to the data.
 */
export const useFirestore = () => getFirestore(getOrInitializeApp());

/**
 * Access the typed collection
 */
export const collection = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
	return useFirestore().collection(collectionName) as CollectionReference<T>;
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

export const assertGlobalAdmin = async (email?: string) => {
	assert(email);
	const admin = (await doc<AdminUser>('admins', email).get()).data();
	assert(admin?.is_global_admin, 'Expected is_global_admin set to true');
};
