import { Prisma } from '@prisma/client';
import { PartnerOrganisation as FirestoreLocalPartner } from '@socialincome/shared/src/types/partner-organisation';

export type FirestoreLocalPartnerWithId = FirestoreLocalPartner & {
	id: string;
};

export type LocalPartnerCreateInput = Prisma.LocalPartnerCreateInput;
