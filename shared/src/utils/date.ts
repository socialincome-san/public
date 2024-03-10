import { DateTime } from 'luxon';
import { Timestamp } from '../types/timestamp';

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

export function toDateTime(timestamp: Timestamp | Date | number, timezone: string = 'utc') {
	if (timestamp instanceof Date) {
		timestamp = timestamp as Date;
		return DateTime.fromJSDate(timestamp, { zone: timezone });
	} else if (Number.isInteger(timestamp)) {
		timestamp = timestamp as number;
		return DateTime.fromMillis(timestamp as number, { zone: timezone });
	} else {
		timestamp = timestamp as Timestamp;
		return DateTime.fromMillis(timestamp.toMillis(), { zone: timezone });
	}
}

export function toDate(dateTime: DateTime) {
	return new Date(dateTime.toMillis());
}

export function daysUntilTs(ts: Date): number {
	const diffInMs = ts.getTime() - new Date().getTime();
	return Math.ceil(diffInMs / (24 * 60 * 60 * 1000));
}
