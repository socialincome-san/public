import { Prisma } from '@prisma/client';

/**
 * A dictionary of currency codes and numeric rates.
 * Example: { USD: 1, EUR: 0.91, SLL: 22250 }
 */
export type ExchangeRates = Record<string, number>;
export type ExchangeRateCreateInput = Prisma.ExchangeRateCreateInput;
