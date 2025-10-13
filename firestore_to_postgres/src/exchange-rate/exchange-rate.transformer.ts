import { Prisma } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreExchangeRate } from './exchange-rate.types';

export class ExchangeRateTransformer extends BaseTransformer<FirestoreExchangeRate, Prisma.ExchangeRateCreateInput> {
	transform = async (input: FirestoreExchangeRate[]): Promise<Prisma.ExchangeRateCreateInput[]> => {
		const transformed: Prisma.ExchangeRateCreateInput[] = [];
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

		for (const entry of input) {
			const timestamp = new Date(entry.timestamp * 1000);
			if (timestamp < oneYearAgo) continue;

			const baseId = entry.id;

			for (const [currency, rate] of Object.entries(entry.rates ?? {})) {
				if (typeof rate !== 'number' || !currency) continue;

				// Skip absurdly large or invalid rates
				if (!isFinite(rate) || Math.abs(rate) >= 1e8) {
					console.warn(`[ExchangeRateTransformer] Skipped ${baseId}_${currency} with invalid rate: ${rate}`);
					continue;
				}

				transformed.push({
					legacyFirestoreId: `${baseId}_${currency}`,
					currency,
					rate: new Prisma.Decimal(rate),
					timestamp,
				});
			}
		}

		return transformed;
	};
}
