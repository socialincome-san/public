import { DocumentSnapshot } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import { Change, EventContext } from 'firebase-functions';
import { FirestoreAuditor } from './FirestoreAuditor';

/**
 * Triggers changes to documents of root collections
 */
export default functions.firestore
	.document('{collectionId}/{document=**}')
	.onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
		const firestoreAuditor = new FirestoreAuditor();
		return firestoreAuditor.auditFirestore(change, context);
	});
