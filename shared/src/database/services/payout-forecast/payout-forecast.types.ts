import { PayoutForecast as PrismaPayoutForecast } from '@prisma/client';

export type CreatePayoutForecastInput = Omit<PrismaPayoutForecast, 'id' | 'createdAt' | 'updatedAt'>;
