import { PaymentEventType, PayoutStatus, Prisma } from '@prisma/client';
import { Payment } from '@socialincome/shared/src/types/payment';
import { Recipient } from '@socialincome/shared/src/types/recipient';

export const PAYMENT_FIRESTORE_PATH = 'payments';
export const RECIPIENT_FIRESTORE_PATH = 'recipients';

export type FirestoreRecipientWithId = Recipient & { id: string; legacyFirestoreId: string };
export type FirestorePaymentWithId = Payment & { id: string; legacyFirestoreId: string };

export type FirestorePayoutWithRecipient = {
	payout: FirestorePaymentWithId;
	recipient: FirestoreRecipientWithId;
};

export type PaymentEventCreateInput = {
	type: PaymentEventType;
	transactionId: string | null;
	metadata: Prisma.InputJsonValue | null;
};

export type PayoutCreateInput = Prisma.PayoutCreateInput;

export type TransformedPayout = {
	legacyFirestoreId: string;
	recipientLegacyId: string;
	amount: number;
	currency: string;
	status: PayoutStatus;
};

export type PayoutWithPayment = {
	payout: PayoutCreateInput;
};
