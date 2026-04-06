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
	if (value === '' || value === null || value === undefined) {
		return null;
	}

	return value;
}, z.coerce.date().nullable());

const localPartnerContactInputSchema = z.object({
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

export const localPartnerCreateInputSchema = z.object({
	name: z.string().trim().min(1, 'Name is required.'),
	focuses: z.array(z.string().trim().min(1)).default([]),
	contact: localPartnerContactInputSchema,
});

export const localPartnerUpdateInputSchema = localPartnerCreateInputSchema.extend({
	id: z.string().trim().min(1, 'Local partner id is required.').optional(),
});

export type LocalPartnerFormCreateInput = z.infer<typeof localPartnerCreateInputSchema>;
export type LocalPartnerFormUpdateInput = z.infer<typeof localPartnerUpdateInputSchema>;
