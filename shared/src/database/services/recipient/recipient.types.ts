import { Recipient } from '@prisma/client';

export type CreateRecipientInput = Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>;

export type RecipientTableRow = {
	id: string;
	firstName: string;
	lastName: string;
};
