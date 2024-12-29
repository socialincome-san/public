import { logger } from 'firebase-functions';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { DateTime } from 'luxon';
import { FirestoreAuditor } from './FirestoreAuditor';

const auditFirestore = onDocumentWritten({ document: '{collectionId}/{document=**}' }, async (event) => {
	const firestoreAuditor = new FirestoreAuditor();
	if (!event.data) {
		logger.warn('No data in event');
		return;
	}
	await firestoreAuditor.auditFirestore(event.data, DateTime.fromISO(event.time));
});

export default auditFirestore;
