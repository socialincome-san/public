import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { DateTime } from 'luxon';
import { FirestoreAuditor } from './FirestoreAuditor';

/**
 * Triggers changes to documents of root collections
 */
export default onDocumentWritten('{collectionId}/{document=**}', async (event) => {
	const firestoreAuditor = new FirestoreAuditor();
	return firestoreAuditor.auditFirestore(event.data!, DateTime.fromISO(event.time));
});
