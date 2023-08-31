import { Timestamp } from '@socialincome/shared/src/firebase';
import { EntityReference } from 'firecms';

export const PAYMENT_FIRESTORE_PATH = 'payments';

export enum PaymentStatus {
	Created = 'created',
	Paid = 'paid',
	Confirmed = 'confirmed',
	Contested = 'contested',
	Failed = 'failed',
	Other = 'other',
}

export type Payment = {
	amount: number;
	amount_chf?: number;
	currency: 'SLL' | 'SLE';
	payment_at: Timestamp;
	status: PaymentStatus;
	phone_number?: number;
	comments?: string;
	message?: EntityReference[];
};

export enum PaymentProcessTaskType {
	UpdateRecipients = 'UpdateRecipients',
	GetRegistrationCSV = 'GetRegistrationCSV',
	GetPaymentCSV = 'GetPaymentCSV',
	CreatePayments = 'CreatePayments',
	SendNotifications = 'SendNotifications',
}

export const PAYMENT_AMOUNT = 700;
export const PAYMENTS_COUNT = 36;
export const PAYMENT_CURRENCY = 'SLE';
