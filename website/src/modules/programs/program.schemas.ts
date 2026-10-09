import { Currency, PayoutInterval, Profile } from '@/generated/prisma/enums';
import { EMAIL_REGEX } from '@/lib/utils/regex';
import z from 'zod';

const positiveIntegerSchema = z.coerce.number().int().min(1);
const nonNegativeIntegerSchema = z.coerce.number().int().min(0);
const positiveNumberSchema = z.coerce.number().positive();

export const programCreateSchema = z.object({
	countryId: z.string().trim().min(1, 'Country is required.'),
	amountOfRecipientsForStart: nonNegativeIntegerSchema,
	programDurationInMonths: positiveIntegerSchema,
	payoutPerInterval: positiveNumberSchema,
	payoutInterval: z.nativeEnum(PayoutInterval),
	targetFocuses: z.array(z.string().trim().min(1)).default([]),
	targetProfiles: z.array(z.nativeEnum(Profile)).default([]),
});

export const publicOnboardingUserDetailsSchema = z.object({
	email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Please enter a valid email address'),
	firstName: z.string().trim().min(1, 'Please enter your first name and last name'),
	lastName: z.string().trim().min(1, 'Please enter your first name and last name'),
});

export const programSettingsUpdateSchema = z.object({
	id: z.string().trim().min(1, 'Program id is required.'),
	name: z.string().trim().min(2, 'Program name must be at least 2 characters.'),
	slug: z.string().trim().min(1, 'Slug is required.'),
	countryId: z.string().trim().min(1, 'Country is required.'),
	coveredByReserves: z.boolean().default(false),
	programDurationInMonths: positiveIntegerSchema,
	payoutPerInterval: positiveNumberSchema,
	payoutInterval: z.nativeEnum(PayoutInterval),
	targetFocuses: z.array(z.string().trim().min(1)).default([]),
	targetProfiles: z.array(z.nativeEnum(Profile)).default([]),
	ownerOrganizationIds: z.array(z.string().trim().min(1)).default([]),
	operatorOrganizationIds: z.array(z.string().trim().min(1)).min(1, 'At least one operator organization is required.'),
});

export const programIdSchema = z.string().trim().min(1, 'Program id is required.');
export const programSlugSchema = z.string().trim().min(1, 'Program slug is required.');
export const programSlugsSchema = z.array(programSlugSchema);

export const programBudgetCalculationSchema = z.object({
	amountOfRecipients: nonNegativeIntegerSchema,
	programDuration: positiveIntegerSchema,
	defaultPayoutPerInterval: positiveNumberSchema,
	payoutPerInterval: positiveNumberSchema,
	payoutInterval: z.nativeEnum(PayoutInterval),
	payoutCurrency: z.nativeEnum(Currency),
	displayCurrency: z.nativeEnum(Currency),
});

export const programFinancesStatsSchema = z.object({
	payoutCurrency: z.nativeEnum(Currency),
	paidOutSoFarChf: z.number(),
	totalProgramCostsChf: z.number(),
	availableCreditsChf: z.number(),
	paidOutSoFarProgramCurrency: z.number(),
	totalProgramCostsProgramCurrency: z.number(),
	availableCreditsProgramCurrency: z.number(),
});

export const programDisplayCurrencySchema = z.enum(['CHF', 'EUR', 'USD']);

export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
export type PublicOnboardingUserDetailsInput = z.infer<typeof publicOnboardingUserDetailsSchema>;
export type ProgramSettingsUpdateInput = z.infer<typeof programSettingsUpdateSchema>;
export type ProgramBudgetCalculationInput = z.infer<typeof programBudgetCalculationSchema>;
export type ProgramFinancesStatsInput = z.infer<typeof programFinancesStatsSchema>;
