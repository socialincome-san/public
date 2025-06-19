import { Organization as PrismaOrganization } from '@prisma/client';

export type CreateOrganizationInput = Omit<PrismaOrganization, 'id' | 'createdAt' | 'updatedAt'>;
