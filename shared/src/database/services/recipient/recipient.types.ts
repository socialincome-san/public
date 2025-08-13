import { Recipient, RecipientStatus } from '@prisma/client';

export type CreateRecipientInput = Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>;

export type RecipientTableDbShape = {
	id: string;
	status: Recipient['status'];
	localPartner: { name: string } | null;
	user: { firstName: string | null; lastName: string | null; birthDate: Date | null } | null;
};

export type RecipientTableFlatShape = {
	id: string;
	firstName: string;
	lastName: string;
	age: number | null;
	status: RecipientStatus;
	localPartnerName: string;
};
