import { describe, test } from '@jest/globals';
import { default as functions } from 'firebase-functions-test';
import { getOrInitializeFirebaseAdmin } from './app';
import { FirestoreAdmin } from './FirestoreAdmin';

interface TestInterface {
	name: string;
}

describe('useFirestoreAdmin', () => {
	const projectId = 'test-' + new Date().getTime();
	const testEnv = functions({ projectId });
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId: projectId }));

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
