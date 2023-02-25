import { EntityReference } from '@camberi/firecms';
import moment from 'moment';

export const RECIPIENT_FIRESTORE_PATH = 'recipients';

export enum RecipientProgramStatus {
	Active = 'active',
	Waitlisted = 'waitlisted',
	Designated = 'designated',
	Former = 'former',
}

// TODO change to using a standard like ISO 639-3.
export enum RecipientMainLanguage {
	Krio = 'krio',
	Mende = 'mende',
	Temne = 'temne',
	Limba = 'limba',
	English = 'en',
	Other = 'other',
}

export type Recipient = {
	birth_date: Date;
	calling_name: string;
	communication_mobile_phone: {
		equals_mobile_money: boolean;
		phone: number;
		has_whatsapp: boolean;
	};
	email: string;
	first_name: string;
	gender: string;
	im_link: string;
	im_uid: string;
	is_suspended: boolean;
	insta_handle: string;
	last_name: string;
	main_language: RecipientMainLanguage;
	mobile_money_phone: {
		phone: number;
		has_whatsapp: boolean;
	};
	organisation: EntityReference;
	om_uid: number;
	profession: string;
	progr_status: RecipientProgramStatus;
	si_start_date: Date; //for NGO disabled
	speaks_english: boolean;
	test_recipient: boolean;
	twitter_handle: string;
	im_link_initial: string;
	im_link_regular: string;
};

/**
 * The start date defines the first payment. Afterwards we expect 35 more contributions
 */
export const calcLastPaymentDate = (startDate: Date) => {
	return moment(startDate).add(35, 'months').toDate();
};
/**
 * How many payments (months) are still left
 */
export const calcPaymentsLeft = (lastPayment: Date, now: Date = new Date()) => {
	const diff = moment(lastPayment).diff(moment(now), 'months', true);
	return diff >= 0 ? Math.ceil(diff) : Math.floor(diff);
};
