import { Currency } from '@/generated/prisma/enums';
import { z } from 'zod';

export const requestOtpSchema = z.object({
	phoneNumber: z.string(),
});

export const verifyOtpSchema = z.object({
	phoneNumber: z.string(),
	otp: z.string(),
});

export const sessionIdTokenSchema = z.string().min(1, 'missing-id-token');

export const websiteLocaleSchema = z.object({
	lang: z.enum(['en', 'de', 'fr', 'it', 'kri']),
	currency: z.enum([Currency.CHF, Currency.EUR, Currency.USD]),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
