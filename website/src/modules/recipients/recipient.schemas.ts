import { CountryCode, Gender } from '@/generated/prisma/enums';
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

const recipientContactInputSchema = z.object({
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

const recipientPaymentInformationInputSchema = z.object({
	mobileMoneyProviderId: optionalTrimmedString,
	code: nullableTrimmedString,
	phone: optionalTrimmedString,
});

export const recipientCreateSchema = z.object({
	startDate: optionalDate,
	suspendedAt: optionalDate,
	suspensionReason: nullableTrimmedString,
	successorName: nullableTrimmedString,
	termsAccepted: z.boolean().optional().default(false),
	programId: optionalTrimmedString,
	localPartnerId: optionalTrimmedString,
	contact: recipientContactInputSchema,
	paymentInformation: recipientPaymentInformationInputSchema,
});

export const recipientUpdateSchema = recipientCreateSchema.extend({
	id: z.string().trim().min(1, 'Recipient id is required.'),
});

export const recipientIdSchema = z.string().trim().min(1, 'Recipient id is required.');

export const recipientSessionTypeSchema = z.enum(['user', 'local-partner', 'contributor']);

export const recipientCsvFileSchema = z.instanceof(File);

export const recipientSelfUpdateSchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	callingName: z.string().optional(),
	gender: z.enum(['male', 'female', 'other', 'private']).optional(),
	dateOfBirth: z.string().optional(),
	language: z.string().optional(),
	email: z.string().email().optional(),
	termsAccepted: z.boolean().optional(),
	contactPhone: z.string().nullable().optional(),
	paymentPhone: z.string().optional(),
	paymentProvider: z.string().optional(),
	successorName: z.string().optional(),
});

export type CreateRecipientInput = z.infer<typeof recipientCreateSchema>;
export type UpdateRecipientInput = z.infer<typeof recipientUpdateSchema>;
export type UpdateRecipientSelfInput = z.infer<typeof recipientSelfUpdateSchema>;
