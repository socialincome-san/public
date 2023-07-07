import assert from 'assert';
import { firestore } from 'firebase-admin';
import {
	CollectionGroup,
	CollectionReference,
	DocumentData,
	DocumentReference,
	getFirestore,
	Query,
	QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { App } from 'firebase-admin/lib/app';
import { AdminUser } from '../../types';
import { getOrInitializeFirebaseAdmin } from './app';
import Firestore = firestore.Firestore;

export class FirestoreAdmin {
	/**
	 * direct access to the admin firestore instance. Deployed, this has full admin access to the data.
	 */
	readonly firestore: Firestore;

	constructor(app?: App) {
		app = app ? app : getOrInitializeFirebaseAdmin();
		this.firestore = getFirestore(app);
	}

	/**
	 * Access the typed collection
	 */
	collection = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
		return this.firestore.collection(collectionName) as CollectionReference<T>;
	};

	/**
	 * Access the typed collection group
	 */
	collectionGroup = <T = DocumentData>(collectionName: string): CollectionGroup<T> => {
		return this.firestore.collectionGroup(collectionName) as CollectionGroup<T>;
	};

	/**
	 * Access the typed document of a collection
	 */
	doc = <T = DocumentData>(collectionName: string, docId?: string): DocumentReference<T> => {
		return docId ? this.collection<T>(collectionName).doc(docId) : this.collection<T>(collectionName).doc();
	};

	/**
	 * Find the first document matching the optional query
	 */
	findFirst = async <T = DocumentData>(
		collectionName: string,
		query: (col: CollectionReference<T>) => Query<T> = (query) => query,
	): Promise<QueryDocumentSnapshot<T> | undefined> => {
		const snapshot = await query(this.collection<T>(collectionName)).get();
		return snapshot.docs.at(0);
	};

	/**
	 * Retrieve all documents matching the optional query
	 */
	getAll = async <T = DocumentData>(
		collectionName: string,
		query: (col: CollectionReference<T>) => Query<T> = (query) => query,
	): Promise<T[]> => {
		const snapshot = await query(this.collection<T>(collectionName)).get();
		return snapshot.docs.map((q) => q.data());
	};

	assertGlobalAdmin = async (email?: string) => {
		assert(email);
		const admin = (await this.doc<AdminUser>('admins', email).get()).data();
		assert(admin?.is_global_admin, 'Expected is_global_admin set to true');
	};
}
