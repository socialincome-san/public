import { ContributorReferralSource, CountryCode, Gender } from '@/generated/prisma/enums';
import { z } from 'zod';

const wizardDonationContextSchema = z
	.object({
		monthlyIncome: z.number().nullable(),
		selectedAmount: z.union([z.literal(25), z.literal(50), z.literal(100), z.literal('other'), z.null()]),
		customAmount: z.number().nullable(),
		cadence: z.enum(['monthly', 'one-time']),
		selectedTier: z.enum(['1x', '2x']),
		paymentMethod: z.enum(['qr', 'online']),
		chargeMonthlyHalfOfOneTimeAmount: z.boolean(),
		campaignId: z.string().trim().min(1).optional(),
	})
	.passthrough();

const qrDonorSchema = z.object({
	email: z.string().trim().email(),
	firstName: z.string().trim().min(1),
	lastName: z.string().trim().min(1),
	language: z.string().trim().min(1),
});

const contributorReferenceSchema = z
	.string()
	.trim()
	.regex(/^\d{1,13}$/, 'Invalid contributor reference');
const contributionReferenceSchema = z
	.string()
	.trim()
	.regex(/^\d{1,10}$/, 'Invalid contribution reference');

export const createWizardQrBillSchema = z.object({
	wizardContext: wizardDonationContextSchema,
	donor: qrDonorSchema,
	currency: z.string().optional(),
});

export const createWizardPendingContributionSchema = z.object({
	wizardContext: wizardDonationContextSchema,
	contributionReferenceId: contributionReferenceSchema,
	userData: qrDonorSchema.extend({
		paymentReferenceId: contributorReferenceSchema,
	}),
	currency: z.string().optional(),
});

export const getQrOnboardingPrefillSchema = z.object({
	paymentReferenceId: contributorReferenceSchema,
	expectedEmail: z.string().trim().email(),
});

export const updateContributorAfterQrPaymentSchema = getQrOnboardingPrefillSchema.extend({
	user: z.object({
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

export const updateContributorReferralAfterQrPaymentSchema = getQrOnboardingPrefillSchema.extend({
	referral: z.nativeEnum(ContributorReferralSource),
});

export const downloadWizardQrBillPdfSchema = z.object({
	wizardContext: wizardDonationContextSchema,
	contributorReferenceId: contributorReferenceSchema,
	contributionReferenceId: contributionReferenceSchema,
	expectedEmail: z.string().trim().email(),
	currency: z.string().optional(),
});

export const subscriptionQrBillSchema = z.object({
	subscriptionId: z.string().trim().min(1, 'Subscription id is required.'),
});

export type WizardDonationContextInput = z.infer<typeof wizardDonationContextSchema>;
export type CreateWizardQrBillInput = z.infer<typeof createWizardQrBillSchema>;
export type CreateWizardPendingContributionInput = z.infer<typeof createWizardPendingContributionSchema>;
export type GetQrOnboardingPrefillInput = z.infer<typeof getQrOnboardingPrefillSchema>;
export type UpdateContributorAfterQrPaymentInput = z.infer<typeof updateContributorAfterQrPaymentSchema>;
export type UpdateContributorReferralAfterQrPaymentInput = z.infer<typeof updateContributorReferralAfterQrPaymentSchema>;
export type DownloadWizardQrBillPdfInput = z.infer<typeof downloadWizardQrBillPdfSchema>;
