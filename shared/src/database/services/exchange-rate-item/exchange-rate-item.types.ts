import { ExchangeRateItem as PrismaExchangeRateItem } from '@prisma/client';

export type CreateExchangeRateItemInput = Omit<PrismaExchangeRateItem, 'id' | 'createdAt' | 'updatedAt'>;
