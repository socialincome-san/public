import { ExchangeRate } from '@prisma/client';

export type CreateExchangeRateInput = Omit<ExchangeRate, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * A dictionary of currency codes and numeric rates.
 * Example: { USD: 1, EUR: 0.91, SLL: 22250 }
 */
export type ExchangeRates = Record<string, number>;
