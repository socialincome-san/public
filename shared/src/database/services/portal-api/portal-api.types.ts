import { Prisma } from '@prisma/client';

export type RecipientWithRelations = Prisma.RecipientGetPayload<{
	include: {
		contact: true;
		program: true;
		localPartner: { include: { contact: true } };
		paymentInformation: { include: { phone: true } };
	};
}>;

export type RecipientUpdateInput = Pick<Prisma.ContactUpdateInput, 'firstName' | 'lastName'>;
