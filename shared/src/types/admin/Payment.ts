import { EntityReference } from '@camberi/firecms';
import { Timestamp } from '@google-cloud/firestore';

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
	currency: 'SLL' | 'SLE';
	payment_at: Timestamp;
	status: PaymentStatus;
	comments?: string;
	message?: EntityReference[];
};

export enum AdminPaymentProcessTask {
	GetRegistrationCSV = 'PaymentProcessTask.GetRegistrationCSV',
	GetPaymentCSV = 'PaymentProcessTask.GetPaymentCSV',
	CreateNewPayments = 'PaymentProcessTask.CreateNewPayments',
	SendNotifications = 'PaymentProcessTask.SendNotifications',
}

export const PAYMENT_AMOUNT = 500;
export const PAYMENT_CURRENCY = 'SLE';
