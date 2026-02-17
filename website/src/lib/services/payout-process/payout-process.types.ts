import { PayoutStatus } from '@/generated/prisma/client';

export type PayoutRecipient = {
	id: string;
	contact: { firstName: string; lastName: string };
	paymentInformation: {
		code: string | null;
		phone: { number: string } | null;
	} | null;
	program: {
		payoutPerInterval: number;
		payoutCurrency: string;
		programDurationInMonths: number;
	};
	payouts: {
		paymentAt: Date;
		status: PayoutStatus;
	}[];
};

export type PreviewPayout = {
	recipientId: string;
	firstName: string;
	lastName: string;
	phoneNumber: string | null;
	currency: string;
	amount: number;
	amountChf: number | null;
	paymentAt: Date;
	status: PayoutStatus;
};
