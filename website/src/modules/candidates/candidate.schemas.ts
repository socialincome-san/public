import { CountryCode, Gender, Profile } from '@/generated/prisma/enums';
import z from 'zod';

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

const candidateContactSchema = z.object({
	firstName: z.string().trim().min(2, 'First name must be at least 2 characters.'),
	lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.'),
	callingName: nullableTrimmedString,
	email: nullableTrimmedString,
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

const candidatePaymentInformationSchema = z.object({
	mobileMoneyProviderId: optionalTrimmedString,
	code: nullableTrimmedString,
	phone: optionalTrimmedString,
});

export const candidateCreateSchema = z.object({
	suspendedAt: optionalDate,
	suspensionReason: nullableTrimmedString,
	successorName: nullableTrimmedString,
	termsAccepted: z.boolean().optional().default(false),
	localPartnerId: optionalTrimmedString,
	contact: candidateContactSchema,
	paymentInformation: candidatePaymentInformationSchema,
});

export const candidateUpdateSchema = candidateCreateSchema.extend({
	id: z.string().trim().min(1, 'Candidate id is required.'),
});

export const candidateIdSchema = z.string().trim().min(1, 'Candidate id is required.');
export const candidateSessionTypeSchema = z.enum(['user', 'local-partner', 'contributor']);
export const candidateCsvFileSchema = z.instanceof(File);
export const candidateCountSchema = z.object({
	focuses: z.array(z.string()),
	profiles: z.array(z.nativeEnum(Profile)),
	countryId: z.string().nullable(),
});

export type CandidateCreateInput = z.infer<typeof candidateCreateSchema>;
export type CandidateUpdateInput = z.infer<typeof candidateUpdateSchema>;
