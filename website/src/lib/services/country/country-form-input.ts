import { CountryCode, Currency, NetworkTechnology, SanctionRegime } from '@/generated/prisma/enums';
import z from 'zod';

const sourceLinkSchema = z.object({
	text: z.string().trim().min(1),
	href: z.string().trim().min(1),
});

export const countryCreateInputSchema = z.object({
	isoCode: z.nativeEnum(CountryCode),
	isActive: z.boolean().optional().default(false),
	currency: z.nativeEnum(Currency),
	defaultPayoutAmount: z.coerce.number().positive('Default payout amount must be greater than 0.'),
	microfinanceIndex: z.coerce.number().min(0).max(10).nullable().optional().default(null),
	cashConditionOverride: z.boolean().optional().default(false),
	populationCoverage: z.coerce.number().min(0).max(100).nullable().optional().default(null),
	networkTechnology: z.nativeEnum(NetworkTechnology).nullable().optional().default(null),
	latestSurveyDate: z.coerce.date().nullable().optional().default(null),
	mobileMoneyProviderIds: z.array(z.string().trim().min(1)).optional().default([]),
	mobileMoneyConditionOverride: z.boolean().optional().default(false),
	sanctions: z.array(z.nativeEnum(SanctionRegime)).optional().default([]),
	microfinanceSourceLink: sourceLinkSchema.nullable().optional().default(null),
	networkSourceLink: sourceLinkSchema.nullable().optional().default(null),
});

export const countryUpdateInputSchema = countryCreateInputSchema.extend({
	id: z.string().trim().min(1, 'Country id is required.').optional(),
});

export type CountryFormCreateInput = z.infer<typeof countryCreateInputSchema>;
export type CountryFormUpdateInput = z.infer<typeof countryUpdateInputSchema>;
