import { Payout as PrismaPayout } from '@prisma/client';

export type CreatePayoutInput = Omit<PrismaPayout, 'id' | 'createdAt' | 'updatedAt'>;
