import { DocumentSnapshot } from '@google-cloud/firestore';
import { Change } from 'firebase-functions';
import { isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';

import { toFirebaseAdminTimestamp } from '../../../../../shared/src/firebase/admin/utils';

/**
 * Watches write updates in collection and subcollections and inserts the previous record value into a
 * "{collectionName}-history" collection. In there, for each document id we maintain a history subcollection
 * with containing all the previous versions of a document.
 */
export class FirestoreAuditor {
	private readonly firestoreAdmin: FirestoreAdmin;

	constructor() {
		this.firestoreAdmin = new FirestoreAdmin();
	}

	/**
	 * Takes care of
	 * - updating the last_updated_at to now field in the document which got changed
	 * - saving the previous value into the `{collectionName}-history/{docId}/history table
	 */
	auditFirestore = async (change: Change<DocumentSnapshot>, timestamp: DateTime) => {
		// ignore the history subcollection itself
		if (change.before?.ref.path.includes('history') || change.after?.ref.path.includes('history'))
			return Promise.resolve();
		// Since updating the updatedAt timestamp also triggers again a "write" event, we need to check
		// that there was a change besides the updatedAt field, otherwise we end up in an infinite loop
		const onlyUpdatedAtChanged = isEqual(
			{ ...change.after?.data(), last_updated_at: 0 },
			{ ...change.before?.data(), last_updated_at: 0 },
		);
		if (onlyUpdatedAtChanged) return Promise.resolve(false);
		await this.populateHistory(change, timestamp);
		await this.addLastUpdatedAt(change, timestamp);
	};

	addLastUpdatedAt = (change: Change<DocumentSnapshot>, timestamp: DateTime) => {
		// If change.after is undefined, the doc got deleted. No action required.
		if (!change.after?.data()) return Promise.resolve(false);

		return change.after.ref.set(
			{
				last_updated_at: toFirebaseAdminTimestamp(timestamp),
			},
			{ merge: true },
		);
	};

	populateHistory = (change: Change<DocumentSnapshot>, timestamp: DateTime) => {
		// If change before is empty, the doc is created. No action required
		if (!change.before?.data()) return Promise.resolve(false);

		const pathSegments = change.before.ref.parent.path.split('/');
		pathSegments[0] = pathSegments.at(0) + '-history';
		pathSegments.push(change.before.ref.id);
		pathSegments.push('history');
		const historySubCollection = pathSegments.join('/');
		// If updated add old values, otherwise add empty value with deleted status
		const status = change.after?.data() ? 'updated' : 'deleted';
		console.log(`Saving ${change.before.ref.path} to history table ${historySubCollection}. ${status}.`);
		const data = { ...change.before.data(), status: status };
		return this.firestoreAdmin.doc(historySubCollection, timestamp.toUTC().toString()).set(data);
	};
}
