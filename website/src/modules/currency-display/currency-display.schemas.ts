import { Currency } from '@/generated/prisma/enums';
import { z } from 'zod';

export const chfAmountsDisplayInputSchema = z.object({
	amounts: z.array(z.number().finite()),
});

export const walletPayoutDisplayInputsSchema = z.array(
	z.object({
		totalPayoutsSum: z.number().finite(),
		totalPayoutsSumChf: z.number().finite(),
		payoutCurrency: z.nativeEnum(Currency),
	}),
);
