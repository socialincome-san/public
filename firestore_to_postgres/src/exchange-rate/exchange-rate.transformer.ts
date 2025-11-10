import { Prisma } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreExchangeRate } from './exchange-rate.types';

export class ExchangeRateTransformer extends BaseTransformer<FirestoreExchangeRate, Prisma.ExchangeRateCreateInput> {
	transform = async (input: FirestoreExchangeRate[]): Promise<Prisma.ExchangeRateCreateInput[]> => {
		const transformed: Prisma.ExchangeRateCreateInput[] = [];
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

		for (const entry of input) {
			const timestamp = new Date(entry.timestamp * 1000);
			if (timestamp < oneMonthAgo) {
				continue;
			}

			const baseId = entry.id;

			for (const [currency, rate] of Object.entries(entry.rates ?? {})) {
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
