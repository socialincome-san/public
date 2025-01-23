import { FirestoreAdmin } from '../src/firebase/admin/FirestoreAdmin';

export async function clearFirestoreData(firestoreAdmin: FirestoreAdmin) {
	const collections = await firestoreAdmin.firestore.listCollections();
	const deletePromises = collections.map(async (collection) => {
		const documents = await collection.listDocuments();
		const deleteDocPromises = documents.map((doc) => firestoreAdmin.firestore.recursiveDelete(doc));
		await Promise.all(deleteDocPromises);
	});
	await Promise.all(deletePromises);
}
