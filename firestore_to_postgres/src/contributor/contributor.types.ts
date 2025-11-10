import { Prisma } from '@prisma/client';
import { User as FirestoreContributor } from '@socialincome/shared/src/types/user';

export type FirestoreContributorWithId = FirestoreContributor & {
	id: string;
};
export type ContributorCreateInput = Prisma.AccountCreateInput;
