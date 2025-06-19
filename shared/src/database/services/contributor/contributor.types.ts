import { Contributor as PrismaContributor } from '@prisma/client';

export type CreateContributorInput = Omit<PrismaContributor, 'id' | 'createdAt' | 'updatedAt'>;
