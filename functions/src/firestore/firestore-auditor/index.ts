import { DocumentSnapshot } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import { Change, EventContext } from 'firebase-functions';
import { DateTime } from 'luxon';
import { DEFAULT_REGION } from '../../../../shared/src/firebase';
import { FirestoreAuditor } from './FirestoreAuditor';

/**
 * Triggers changes to documents of root collections
 */
export default functions
	// Using v1 functions because tests are not supported with v2 yet: https://github.com/firebase/firebase-functions-test/issues/163
	.region(DEFAULT_REGION)
	.firestore.document('{collectionId}/{document=**}')
	.onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
		const firestoreAuditor = new FirestoreAuditor();
		return firestoreAuditor.auditFirestore(change, DateTime.fromISO(context.timestamp));
	});
