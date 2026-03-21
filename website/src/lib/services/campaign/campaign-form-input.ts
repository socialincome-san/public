import { Currency } from '@/generated/prisma/enums';
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

const optionalPositiveNumber = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}

	return value;
}, z.coerce.number().positive('Value must be positive.').nullable());

const nullableEmail = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}
	const trimmedValue = value.trim();

	return trimmedValue === '' ? null : trimmedValue;
}, z.string().email('Must be a valid email address.').nullable());

export const campaignCreateInputSchema = z.object({
	title: z.string().trim().min(1, 'Title is required.'),
	description: z.string().trim().min(1, 'Description is required.'),
	secondDescriptionTitle: nullableTrimmedString,
	secondDescription: nullableTrimmedString,
	thirdDescriptionTitle: nullableTrimmedString,
	thirdDescription: nullableTrimmedString,
	linkWebsite: nullableTrimmedString,
	linkInstagram: nullableTrimmedString,
	linkTiktok: nullableTrimmedString,
	linkFacebook: nullableTrimmedString,
	linkX: nullableTrimmedString,
	goal: optionalPositiveNumber,
	currency: z.nativeEnum(Currency),
	additionalAmountChf: optionalPositiveNumber,
	endDate: z.coerce.date(),
	isActive: z.boolean().optional().default(false),
	public: z.boolean().optional().default(false),
	featured: z.boolean().optional().default(false),
	slug: optionalTrimmedString,
	metadataDescription: optionalTrimmedString,
	metadataOgImage: optionalTrimmedString,
	metadataTwitterImage: optionalTrimmedString,
	creatorName: nullableTrimmedString,
	creatorEmail: nullableEmail,
	programId: z.string().trim().min(1, 'Program is required.'),
});

export const campaignUpdateInputSchema = campaignCreateInputSchema.extend({
	id: z.string().trim().min(1, 'Campaign id is required.'),
});

export type CampaignFormCreateInput = z.infer<typeof campaignCreateInputSchema>;
export type CampaignFormUpdateInput = z.infer<typeof campaignUpdateInputSchema>;
