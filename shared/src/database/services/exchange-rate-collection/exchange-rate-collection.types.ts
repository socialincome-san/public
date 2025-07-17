import { ExchangeRateCollection as PrismaExchangeRateCollection } from '@prisma/client';

export type CreateExchangeRateCollectionInput = Omit<PrismaExchangeRateCollection, 'id' | 'createdAt' | 'updatedAt'>;
