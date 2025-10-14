import { Prisma } from '@prisma/client';
import { Recipient as FirestoreRecipient } from '@socialincome/shared/src/types/recipient';

export type FirestoreRecipientWithId = FirestoreRecipient & {
	id: string;
};

export type RecipientCreateInput = Prisma.RecipientCreateInput;
