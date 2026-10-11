import { ContributorReferralSource, CountryCode, Gender } from '@/generated/prisma/enums';
import { z } from 'zod';

const nullableTrimmedString = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmedValue = value.trim();

	return trimmedValue === '' ? null : trimmedValue;
}, z.string().nullable());

const optionalTrimmedString = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmedValue = value.trim();

	return trimmedValue === '' ? undefined : trimmedValue;
}, z.string().optional());

const optionalDate = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}

	return value;
}, z.coerce.date().nullable());

const contributorContactInputSchema = z.object({
	firstName: z.string().trim().min(2, 'First name must be at least 2 characters.'),
	lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.'),
	callingName: nullableTrimmedString,
	email: z.string().trim().email('Please provide a valid email address.'),
	gender: z.nativeEnum(Gender).nullable(),
	language: nullableTrimmedString,
	dateOfBirth: optionalDate,
	profession: nullableTrimmedString,
	phone: optionalTrimmedString,
	hasWhatsApp: z.boolean().optional().default(false),
	street: nullableTrimmedString,
	number: nullableTrimmedString,
	city: nullableTrimmedString,
	zip: nullableTrimmedString,
	country: z.nativeEnum(CountryCode).nullable(),
});

export const contributorCreateSchema = z.object({
	referral: z.nativeEnum(ContributorReferralSource),
	paymentReferenceId: nullableTrimmedString,
	stripeCustomerId: nullableTrimmedString,
	contact: contributorContactInputSchema,
});

export const contributorUpdateSchema = contributorCreateSchema.extend({
	id: z.string().trim().min(1, 'Contributor id is required.'),
});

export const contributorSelfUpdateSchema = z.object({
	referral: z.nativeEnum(ContributorReferralSource).optional(),
	needsOnboarding: z.boolean().optional(),
	paymentReferenceId: z.string().optional(),
	contact: z.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		email: z.string().email('Please provide a valid email address.'),
		gender: z.nativeEnum(Gender).nullable().optional(),
		language: z.string().optional(),
		address: z
			.object({
				street: z.string().optional(),
				number: z.string().optional(),
				city: z.string().optional(),
				zip: z.string().optional(),
				country: z.nativeEnum(CountryCode),
			})
			.optional(),
	}),
});

export const contributorIdSchema = z.string().trim().min(1, 'Contributor id is required.');

export type CreateContributorInput = z.infer<typeof contributorCreateSchema>;
export type UpdateContributorInput = z.infer<typeof contributorUpdateSchema>;
export type UpdateContributorSelfInput = z.infer<typeof contributorSelfUpdateSchema>;
