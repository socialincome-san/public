import type { Currency, PayoutStatus } from '@/generated/prisma/enums';

export type PreviewPayout = {
	recipientId: string;
	firstName: string;
	lastName: string;
	phoneNumber: string | null;
	currency: Currency;
	amount: number;
	amountChf: number | null;
	paymentAt: Date;
	status: PayoutStatus;
};
