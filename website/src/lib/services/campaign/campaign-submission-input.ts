import { Currency } from '@/generated/prisma/enums';
import {
	campaignSubmissionConfig,
	type CampaignSubmissionAllowedCurrency,
	type CampaignSubmissionPermittedImageMimeType,
} from '@/lib/config/campaign-submission.config';
import { slugify } from '@/lib/utils/string-utils';
import { addDays, format, isValid, parse, startOfDay } from 'date-fns';
import z from 'zod';

// Intentional: strip ASCII control characters from untrusted text fields.
// eslint-disable-next-line no-control-regex -- sanitizes form input
const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001F\u007F]/;

const sanitizeText = (value: string) => value.replace(CONTROL_CHARACTERS_REGEX, '').trim();

const isAllowedCurrency = (value: string): value is CampaignSubmissionAllowedCurrency =>
	campaignSubmissionConfig.allowedCurrencies.includes(value as CampaignSubmissionAllowedCurrency);

const isPermittedImageMimeType = (value: string): value is CampaignSubmissionPermittedImageMimeType =>
	campaignSubmissionConfig.permittedImageMimeTypes.includes(value as CampaignSubmissionPermittedImageMimeType);

const campaignSubmissionFieldsSchema = z.object({
	title: z
		.string()
		.transform(sanitizeText)
		.pipe(
			z
				.string()
				.min(1, 'Title is required.')
				.max(campaignSubmissionConfig.maxTitleLength)
				.refine((title) => Boolean(slugify(title)), 'Title must contain letters or numbers.'),
		),
	description: z
		.string()
		.transform(sanitizeText)
		.pipe(z.string().min(1, 'Description is required.').max(campaignSubmissionConfig.maxDescriptionLength)),
	goal: z.coerce.number().positive('Goal must be a positive number.'),
	currency: z
		.string()
		.transform((value) => value.trim().toUpperCase())
		.refine(isAllowedCurrency, 'Currency is not supported.'),
	// Parse YYYY-MM-DD as a local calendar day (z.coerce.date uses UTC midnight and breaks min/max checks).
	endDate: z.string().transform((value, ctx) => {
		const date = parse(value.trim(), 'yyyy-MM-dd', new Date());
		if (!isValid(date) || format(date, 'yyyy-MM-dd') !== value.trim()) {
			ctx.addIssue({ code: 'custom', message: 'End date is invalid.' });

			return z.NEVER;
		}

		return startOfDay(date);
	}),
	programId: z.string().trim().min(1, 'Program is required.'),
});

export type CampaignSubmissionFields = z.infer<typeof campaignSubmissionFieldsSchema>;

export type CampaignSubmissionImageValidation = {
	buffer: Buffer;
	mimeType: CampaignSubmissionPermittedImageMimeType;
	filename: string;
	size: number;
};

const IMAGE_SIGNATURES: { mimeType: CampaignSubmissionPermittedImageMimeType; bytes: number[] }[] = [
	{ mimeType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
	{ mimeType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
	{ mimeType: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
];

const detectImageMimeType = (buffer: Buffer): CampaignSubmissionPermittedImageMimeType | null => {
	for (const signature of IMAGE_SIGNATURES) {
		if (signature.bytes.every((byte, index) => buffer[index] === byte)) {
			if (signature.mimeType === 'image/webp') {
				const webpMarker = buffer.subarray(8, 12).toString('ascii');

				return webpMarker === 'WEBP' ? signature.mimeType : null;
			}

			return signature.mimeType;
		}
	}

	return null;
};

export const validateCampaignSubmissionEndDate = (endDate: Date): string | null => {
	const today = startOfDay(new Date());
	const minEndDate = addDays(today, campaignSubmissionConfig.minCampaignDurationDays);
	const maxEndDate = addDays(today, campaignSubmissionConfig.maxCampaignDurationDays);

	if (endDate < minEndDate) {
		return `End date must be at least ${campaignSubmissionConfig.minCampaignDurationDays} days from today.`;
	}

	if (endDate > maxEndDate) {
		return `End date must be within ${campaignSubmissionConfig.maxCampaignDurationDays} days from today.`;
	}

	return null;
};

export const validateCampaignSubmissionImageBuffer = (
	buffer: Buffer,
	declaredMimeType: string,
	filename: string,
): { success: true; data: CampaignSubmissionImageValidation } | { success: false; error: string } => {
	if (buffer.length > campaignSubmissionConfig.maxImageBytes) {
		return { success: false, error: 'Image exceeds the maximum allowed size.' };
	}

	const detectedMimeType = detectImageMimeType(buffer);
	if (!detectedMimeType) {
		return { success: false, error: 'Image contents are not a supported format.' };
	}

	if (declaredMimeType && isPermittedImageMimeType(declaredMimeType) && declaredMimeType !== detectedMimeType) {
		return { success: false, error: 'Image type does not match file contents.' };
	}

	return {
		success: true,
		data: {
			buffer,
			mimeType: detectedMimeType,
			filename: filename.trim() || 'campaign-image',
			size: buffer.length,
		},
	};
};

export const parseCampaignSubmissionFields = (
	formData: FormData,
): { success: true; data: CampaignSubmissionFields } | { success: false; error: string } => {
	const parsed = campaignSubmissionFieldsSchema.safeParse({
		title: formData.get('title'),
		description: formData.get('description'),
		goal: formData.get('goal'),
		currency: formData.get('currency'),
		endDate: formData.get('endDate'),
		programId: formData.get('programId'),
	});

	if (!parsed.success) {
		return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission.' };
	}

	const endDateError = validateCampaignSubmissionEndDate(parsed.data.endDate);
	if (endDateError) {
		return { success: false, error: endDateError };
	}

	return { success: true, data: parsed.data };
};

export const campaignSubmissionDefaultCurrency = Currency.CHF;
