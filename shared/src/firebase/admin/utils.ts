import { Timestamp as FirestoreAdminTimestamp } from '@google-cloud/firestore';
import { DateTime } from 'luxon';
import { Timestamp } from '../../types/Timestamp';

export function toFirebaseAdminTimestamp(dateTime: DateTime | Date): Timestamp {
	if (dateTime instanceof Date) {
		return FirestoreAdminTimestamp.fromDate(dateTime);
	} else {
		return FirestoreAdminTimestamp.fromMillis(dateTime.toMillis());
	}
}
