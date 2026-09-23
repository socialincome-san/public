import { ContributorReferralSource, CountryCode, Gender } from '@/generated/prisma/enums';
import { z } from 'zod';

const donationWizardAmountContextSchema = z
	.object({
		monthlyIncome: z.number().nullable(),
		selectedAmount: z.union([z.literal(25), z.literal(50), z.literal(100), z.literal('other'), z.null()]),
		customAmount: z.number().nullable(),
		cadence: z.enum(['monthly', 'one-time']),
		selectedTier: z.enum(['1x', '2x']),
		paymentMethod: z.enum(['qr', 'online']),
		chargeMonthlyHalfOfOneTimeAmount: z.boolean(),
		coverTransactionCosts: z.boolean(),
		oneTimePlanChoice: z.enum(['one-time', 'monthly-half']),
		returnsToOneTimePlanStep: z.boolean(),
		campaignId: z.string().optional(),
	})
	.passthrough();

export const stripeEmbeddedCheckoutActionSchema = z.object({
	wizardContext: donationWizardAmountContextSchema,
	currency: z.string().optional(),
	returnPath: z.string().optional(),
});

export const portalProgramDonationCheckoutSchema = z.object({
	amount: z.number().int().positive(),
	programId: z.string().trim().min(1),
	currency: z.string().optional(),
	intervalCount: z.number().int().positive().optional(),
	recurring: z.boolean().optional(),
});

export const stripeCheckoutSessionIdSchema = z.string().trim().min(1, 'Missing checkout session id');

export const updateContributorAfterCheckoutSchema = z.object({
	stripeCheckoutSessionId: stripeCheckoutSessionIdSchema,
	user: z.object({
		email: z.string().trim().email(),
		language: z.string().trim().min(1),
		personal: z.object({
			name: z.string().trim().min(1),
			lastname: z.string().trim().min(1),
			gender: z.nativeEnum(Gender).optional(),
			referral: z.nativeEnum(ContributorReferralSource).optional(),
		}),
		address: z.object({
			country: z.nativeEnum(CountryCode),
		}),
	}),
});

export const updateContributorReferralAfterCheckoutSchema = z.object({
	stripeCheckoutSessionId: stripeCheckoutSessionIdSchema,
	referral: z.nativeEnum(ContributorReferralSource),
});
