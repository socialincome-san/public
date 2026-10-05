import { Currency } from '@/generated/prisma/enums';
import { z } from 'zod';

const websiteCurrencySchema = z.enum([Currency.CHF, Currency.EUR, Currency.USD, Currency.SLE]);

export const chfAmountsDisplayInputSchema = z.object({
	amounts: z.array(z.number().finite()),
	displayCurrency: websiteCurrencySchema,
});

export const walletPayoutDisplayInputSchema = z.object({
	totalPayoutsSum: z.number().finite(),
	totalPayoutsSumChf: z.number().finite(),
	payoutCurrency: z.nativeEnum(Currency),
	displayCurrency: websiteCurrencySchema,
});

export const walletPayoutDisplayInputsSchema = z.array(walletPayoutDisplayInputSchema);
