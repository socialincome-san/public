import { beforeEach, describe, test } from '@jest/globals';
import functionsTest from 'firebase-functions-test';
import auditFirestore from '.';
import { FirestoreAdmin } from '../../../../shared/src/firebase/admin/FirestoreAdmin';
import { getOrInitializeFirebaseAdmin } from '../../../../shared/src/firebase/admin/app';

describe('FirestoreAuditor', () => {
	const projectId = 'auditor' + new Date().getTime();
	const testEnv = functionsTest({ projectId: projectId });
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId: projectId }));

	const testColId = 'test-col';
	const testDocId = 'test-doc';
	const testCol = firestoreAdmin.collection(testColId);
	const testDoc = testCol.doc(testDocId);

	const testColHistory = firestoreAdmin.collection(testColId + '-history');
	const testColHistoryDoc = testColHistory.doc(testDocId);
	const testColHistoryEntry = testColHistory.doc(testDocId).collection('history');

	const testSubColId = 'test-sub-col';
	const testSubDocId = 'test-sub-col-doc';
	const testSubCol = testDoc.collection(testSubColId);
	const testSubColDoc = testSubCol.doc(testSubDocId);

	const testSubColHistory = testColHistoryDoc.collection(testSubColId);
	const testSubColHistoryEntry = testColHistoryDoc.collection(testSubColId).doc(testSubDocId).collection('history');

	beforeEach(async () => {
		await testEnv.firestore.clearFirestoreData({ projectId: projectId });
	});

	test('create a new document in main collection', async () => {
		// setup simulated creation
		await testDoc.set({ foo: 'bar' });
		const snap = testEnv.firestore.makeDocumentSnapshot({ foo: 'bar' }, testDoc.path);
		const change = testEnv.makeChange(null, snap);
		const wrapped = testEnv.wrap(auditFirestore);
		// call the trigger with the simulated change
		await wrapped({ data: change });
		// retrieve the doc. Test that last_updated_at is set
		const updatedDoc = await testDoc.get();
		expect(updatedDoc.data()!.foo).toEqual('bar');
		expect(updatedDoc.data()!.last_updated_at).toBeDefined();

		// test that the history is empty
		const history = await testColHistory.listDocuments();
		expect(history.length).toBe(0);
	});

	test('create a new document in sub collection', async () => {
		// setup simulated creation
		await testSubColDoc.set({ foo: 'bar' });
		const snap = testEnv.firestore.makeDocumentSnapshot({ foo: 'bar' }, testSubColDoc.path);
		const change = testEnv.makeChange(null, snap);
		const wrapped = testEnv.wrap(auditFirestore);
		// call the trigger with the simulated change
		await wrapped({ data: change });
		// retrieve the doc. Test that last_updated_at is set
		const updatedDoc = await testSubColDoc.get();
		expect(updatedDoc.data()!.foo).toEqual('bar');
		expect(updatedDoc.data()!.last_updated_at).toBeDefined();

		// test that the history is empty
		const history = await testColHistory.listDocuments();
		expect(history.length).toBe(0);

		// test that the subcollection history is empty
		const subHistory = await testSubColHistory.listDocuments();
		expect(subHistory.length).toBe(0);
	});

	test('update a document in main collection', async () => {
		// setup simulated update
		await testDoc.set({ foo: 'after', last_updated_at: 123 });
		const snapBefore = testEnv.firestore.makeDocumentSnapshot({ foo: 'before', last_updated_at: 123 }, testDoc.path);
		const snapAfter = testEnv.firestore.makeDocumentSnapshot({ foo: 'after' }, testDoc.path);
		const change = testEnv.makeChange(snapBefore, snapAfter);
		const wrapped = testEnv.wrap(auditFirestore);
		// call the trigger with the simulated change
		await wrapped({ data: change });
		// retrieve the doc. Test that last_updated_at is updated
		const updatedDoc = await testDoc.get();
		expect(updatedDoc.data()!.foo).toEqual('after');
		expect(updatedDoc.data()!.last_updated_at > 123).toBeTruthy();

		// test that the history is populated
		const history = await testColHistoryEntry.get();
		expect(history.docs.length).toBe(1);
		expect(history.docs.at(0)!.data().foo).toEqual('before');
		expect(history.docs.at(0)!.data().status).toEqual('updated');
		expect(history.docs.at(0)!.data().last_updated_at).toEqual(123);
	});

	test('update a document in subcollection', async () => {
		// setup simulated update
		await testSubColDoc.set({ foo: 'after', last_updated_at: 123 });
		const snapBefore = testEnv.firestore.makeDocumentSnapshot(
			{ foo: 'before', last_updated_at: 123 },
			testSubColDoc.path,
		);
		const snapAfter = testEnv.firestore.makeDocumentSnapshot({ foo: 'after' }, testSubColDoc.path);
		const change = testEnv.makeChange(snapBefore, snapAfter);
		const wrapped = testEnv.wrap(auditFirestore);
		// call the trigger with the simulated change
		await wrapped({ data: change });
		// retrieve the doc. Test that last_updated_at is updated
		const updatedDoc = await testSubColDoc.get();
		expect(updatedDoc.data()!.foo).toEqual('after');
		expect(updatedDoc.data()!.last_updated_at > 123).toBeTruthy();

		// test that the history is populated
		const history = await testSubColHistoryEntry.get();
		expect(history.docs.length).toBe(1);
		expect(history.docs.at(0)!.data().foo).toEqual('before');
		expect(history.docs.at(0)!.data().status).toEqual('updated');
		expect(history.docs.at(0)!.data().last_updated_at).toEqual(123);
	});

	test('delete document in main collection', async () => {
		// setup simulated deletion
		const snapBefore = testEnv.firestore.makeDocumentSnapshot({ foo: 'before', last_updated_at: 123 }, testDoc.path);
		const change = testEnv.makeChange(snapBefore, null);
		const wrapped = testEnv.wrap(auditFirestore);
		// call the trigger with the simulated change
		await wrapped({ data: change });

		// test that the history is populated
		const history = await testColHistoryEntry.get();
		expect(history.docs.length).toBe(1);
		expect(history.docs.at(0)!.data().foo).toEqual('before');
		expect(history.docs.at(0)!.data().status).toEqual('deleted');
		expect(history.docs.at(0)!.data().last_updated_at).toEqual(123);
	});

	test('delete document in sub collection', async () => {
		// setup simulated deletion
		const snapBefore = testEnv.firestore.makeDocumentSnapshot(
			{ foo: 'before', last_updated_at: 123 },
			testSubColDoc.path,
		);
		const change = testEnv.makeChange(snapBefore, null);
		const wrapped = testEnv.wrap(auditFirestore);
		// call the trigger with the simulated change
		await wrapped({ data: change });

		// test that the history is populated
		const history = await testSubColHistoryEntry.get();
		expect(history.docs.length).toBe(1);
		expect(history.docs.at(0)!.data().foo).toEqual('before');
		expect(history.docs.at(0)!.data().status).toEqual('deleted');
		expect(history.docs.at(0)!.data().last_updated_at).toEqual(123);
	});

	test('ignore the history table itself', async () => {
		const testHistoryEntryId = '2023-02-19';
		const testHistoryEntry = testColHistory.doc(testHistoryEntryId);
		// setup simulated creation
		await testHistoryEntry.set({ foo: 'bar' });
		const snap = testEnv.firestore.makeDocumentSnapshot({ foo: 'bar' }, testHistoryEntry.path);
		const change = testEnv.makeChange(null, snap);
		const wrapped = testEnv.wrap(auditFirestore);
		// call the trigger with the simulated change
		await wrapped({ data: change });
		// retrieve the doc. Test that last_updated_at is not set
		const updatedDoc = await testHistoryEntry.get();
		expect(updatedDoc.data()!.foo).toEqual('bar');
		expect(updatedDoc.data()!.last_updated_at).toBeUndefined();
	});

	jest.setTimeout(30000);
});
