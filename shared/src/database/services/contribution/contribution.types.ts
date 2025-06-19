import { Contribution as PrismaContribution } from '@prisma/client';

export type CreateContributionInput = Omit<PrismaContribution, 'id' | 'createdAt' | 'updatedAt'>;
