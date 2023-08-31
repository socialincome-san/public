import { Timestamp as FirestoreAdminTimestamp } from 'firebase-admin/firestore';
import { Timestamp as FirestoreClientTimestamp } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { Timestamp } from '../firebase';

export function getMonthId(year: number, month: number) {
	return year + '-' + (month + '').padStart(2, '0');
}

export function getMonthIDs(date: Date, last_n: number) {
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let months = [];
	while (last_n > 0) {
		months.push(getMonthId(year, month));
		month -= 1;
		if (month === 0) {
			month = 12;
			year -= 1;
		}
		last_n -= 1;
	}
	return months;
}

/**
 * Convert a DateTime or Date to a Firestore Timestamp. As the Firebase Admin SDK and the Firebase Client SDK use
 * different Timestamp classes, the useFirebaseAdminSDK parameter can be used to specify which one to use.
 */
export function toTimestamp(dateTime: DateTime | Date, useFirebaseAdminSDK = true): Timestamp {
	if (dateTime instanceof Date) {
		return useFirebaseAdminSDK
			? FirestoreAdminTimestamp.fromDate(dateTime)
			: FirestoreClientTimestamp.fromDate(dateTime);
	} else {
		return useFirebaseAdminSDK
			? FirestoreAdminTimestamp.fromMillis(dateTime.toMillis())
			: FirestoreClientTimestamp.fromMillis(dateTime.toMillis());
	}
}

export function toDateTime(timestamp: Timestamp | Date, timezone: string = 'utc') {
	return timestamp instanceof Date
		? DateTime.fromJSDate(timestamp, { zone: timezone })
		: DateTime.fromMillis(timestamp.toMillis(), { zone: timezone });
}

export function toDate(dateTime: DateTime) {
	return new Date(dateTime.toMillis());
}
