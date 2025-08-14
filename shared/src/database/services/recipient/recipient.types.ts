import { Recipient, RecipientStatus } from '@prisma/client';

export type CreateRecipientInput = Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>;

export type RecipientTableDbShape = {
	id: string;
	status: RecipientStatus;
	localPartner?: { name: string | null } | null;
	user?: { firstName: string | null; lastName: string | null; birthDate: Date | null } | null;
	program?: { totalPayments: number } | null;
	payoutsPaidCount: number;
};

export type RecipientTableFlatShape = {
	id: string;
	firstName: string;
	lastName: string;
	age: number | null;
	status: RecipientStatus;
	localPartnerName: string;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
};

export type RecipientForecastShape = {
	status: RecipientStatus;
	startDate: Date | null;
};
