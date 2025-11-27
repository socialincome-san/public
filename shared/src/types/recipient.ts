import { DocumentReference } from 'firebase-admin/firestore';
import { DateTime } from 'luxon';
import { PartnerOrganisation } from './partner-organisation';
import { Timestamp } from './timestamp';

export const RECIPIENT_FIRESTORE_PATH = 'recipients';

export enum RecipientProgramStatus {
	Active = 'active',
	Suspended = 'suspended',
	Waitlisted = 'waitlisted',
	Designated = 'designated',
	Former = 'former',
}

export enum RecipientMainLanguage {
	Krio = 'kri',
	English = 'en',
}

export type Recipient = {
	birth_date: Date;
	calling_name?: string;
	communication_mobile_phone?: {
		phone: number;
		has_whatsapp: boolean;
		whatsapp_activated: boolean;
	};
	email?: string;
	first_name: string;
	gender: 'male' | 'female';
	insta_handle?: string;
	last_name: string;
	main_language?: RecipientMainLanguage;
	mobile_money_phone?: {
		phone: number;
		has_whatsapp: boolean;
	};
	organisation: DocumentReference<PartnerOrganisation>;
	om_uid?: number;
	profession?: string;
	progr_status: RecipientProgramStatus;
	si_start_date?: Timestamp;
	test_recipient?: boolean;
	twitter_handle?: string;
	successor?: string;
	terms_accepted?: boolean;
};

export const toPaymentDate = (dateTime: DateTime) => {
	return dateTime.set({
		day: 15,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0,
	});
};

/**
 * The start date defines the first payment. Afterward, we expect 35 more contributions
 */
export const calcFinalPaymentDate = (startDate: DateTime) => {
	return toPaymentDate(startDate).plus({
		months: 35,
	});
};

/**
 * How many payments (months) are still left
 */
export const calcPaymentsLeft = (lastPayment: DateTime, now: DateTime = DateTime.now()) => {
	const diff = lastPayment.diff(now, 'months').months;
	return diff >= 0 ? Math.ceil(diff) : Math.floor(diff);
};
