import admin from 'firebase-admin';
import { DateTime } from 'luxon';
import { Timestamp } from '../../types/timestamp';

export const FirestoreAdminTimestamp = admin.firestore.Timestamp;

export function toFirebaseAdminTimestamp(dateTime: DateTime | Date): Timestamp {
	if (dateTime instanceof Date) {
		return FirestoreAdminTimestamp.fromDate(dateTime);
	} else {
		return FirestoreAdminTimestamp.fromMillis(dateTime.toMillis());
	}
}
