import { Currency } from '@/generated/prisma/enums';
import { z } from 'zod';

const displayCurrencySchema = z.enum([Currency.CHF, Currency.EUR, Currency.USD]);

export const chfAmountsDisplayInputSchema = z.object({
	amounts: z.array(z.number().finite()),
	displayCurrency: displayCurrencySchema,
});

export const walletPayoutDisplaysInputSchema = z.object({
	payouts: z.array(
		z.object({
			totalPayoutsSum: z.number().finite(),
			totalPayoutsSumChf: z.number().finite(),
			payoutCurrency: z.nativeEnum(Currency),
		}),
	),
	displayCurrency: displayCurrencySchema,
});
