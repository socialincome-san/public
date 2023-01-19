import { describe, test } from '@jest/globals';
import * as admin from 'firebase-admin';
import { default as functions } from 'firebase-functions-test';
import { FirestoreAdmin } from '../src/firebase/FirestoreAdmin';

interface TestInterface {
	name: string;
}

describe('useFirestoreAdmin', () => {
	const projectId = 'test-' + new Date().getTime();
	const testEnv = functions({ projectId });
	const firestoreAdmin = new FirestoreAdmin(admin.initializeApp({ projectId: projectId }));

	beforeEach(async () => {
		await testEnv.firestore.clearFirestoreData({ projectId });
	});

	test('findFirst', async () => {
		const collection = 'test-collection';
		const document = 'test-document';
		const name = 'test-name';
		const testDocument = {
			name,
		};
		await firestoreAdmin.doc<TestInterface>(collection, document).set(testDocument);
		const retrievedDocument = await firestoreAdmin.findFirst<TestInterface>(collection, (query) =>
			query.where('name', '==', name)
		);
		expect(retrievedDocument!.data()).toEqual(testDocument);
	});
});
