import { CountryCode, Gender } from '@/generated/prisma/enums';
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
	if (value === '' || value == null) {
		return null;
	}
	return value;
}, z.coerce.date().nullable());

const candidateContactInputSchema = z.object({
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

const candidatePaymentInformationInputSchema = z.object({
	mobileMoneyProviderId: optionalTrimmedString,
	code: nullableTrimmedString,
	phone: optionalTrimmedString,
});

export const candidateCreateInputSchema = z.object({
	suspendedAt: optionalDate,
	suspensionReason: nullableTrimmedString,
	successorName: nullableTrimmedString,
	termsAccepted: z.boolean().optional().default(false),
	localPartnerId: optionalTrimmedString,
	contact: candidateContactInputSchema,
	paymentInformation: candidatePaymentInformationInputSchema,
});

export const candidateUpdateInputSchema = candidateCreateInputSchema.extend({
	id: z.string().trim().min(1, 'Candidate id is required.'),
});

export type CandidateFormCreateInput = z.infer<typeof candidateCreateInputSchema>;
export type CandidateFormUpdateInput = z.infer<typeof candidateUpdateInputSchema>;
