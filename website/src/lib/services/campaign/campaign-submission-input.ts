import { Currency } from '@/generated/prisma/enums';
import {
	campaignSubmissionConfig,
	campaignSubmissionDurationPresets,
	type CampaignSubmissionAllowedCurrency,
	type CampaignSubmissionDurationPreset,
	type CampaignSubmissionPermittedImageMimeType,
} from '@/lib/config/campaign-submission.config';
import { slugify } from '@/lib/utils/string-utils';
import { addDays, format, isValid, parse, startOfDay } from 'date-fns';
import z from 'zod';

// Intentional: strip ASCII control characters from untrusted text fields.
// eslint-disable-next-line no-control-regex -- sanitizes form input
const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001F\u007F]/;

export const campaignSubmissionErrorCodes = [
	'title-required',
	'title-too-long',
	'title-not-slugifiable',
	'description-required',
	'description-too-long',
	'goal-positive',
	'currency-unsupported',
	'end-date-required',
	'end-date-invalid',
	'end-date-too-soon',
	'end-date-too-late',
	'program-required',
	'image-required',
	'image-too-large',
	'image-format-unsupported',
	'image-type-mismatch',
	'default-image-invalid',
	'payload-too-large',
	'invalid-form-data',
	'invalid-submission',
	'program-not-eligible',
	'title-exists',
	'similar-title-exists',
	'submission-failed',
] as const;

export type CampaignSubmissionErrorCode = (typeof campaignSubmissionErrorCodes)[number];

const campaignSubmissionErrorCodeSet = new Set<string>(campaignSubmissionErrorCodes);

export const isCampaignSubmissionErrorCode = (value: string): value is CampaignSubmissionErrorCode =>
	campaignSubmissionErrorCodeSet.has(value);

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
				.min(1, 'title-required')
				.max(campaignSubmissionConfig.maxTitleLength, 'title-too-long')
				.refine((title) => Boolean(slugify(title)), 'title-not-slugifiable'),
		),
	description: z
		.string()
		.transform(sanitizeText)
		.pipe(
			z.string().min(1, 'description-required').max(campaignSubmissionConfig.maxDescriptionLength, 'description-too-long'),
		),
	goal: z.union([z.string(), z.number(), z.null()]).transform((value, ctx) => {
		if (value === null || value === '') {
			return null;
		}

		const numeric = typeof value === 'number' ? value : Number(value);
		if (!Number.isFinite(numeric) || numeric <= 0) {
			ctx.addIssue({ code: 'custom', message: 'goal-positive' });

			return z.NEVER;
		}

		return numeric;
	}),
	currency: z
		.string()
		.transform((value) => value.trim().toUpperCase())
		.refine(isAllowedCurrency, 'currency-unsupported'),
	// Parse YYYY-MM-DD as a local calendar day (z.coerce.date uses UTC midnight and breaks min/max checks).
	endDate: z.string().transform((value, ctx) => {
		const date = parseCampaignSubmissionEndDate(value);
		if (!date) {
			ctx.addIssue({ code: 'custom', message: 'end-date-invalid' });

			return z.NEVER;
		}

		return date;
	}),
	programId: z.string().trim().min(1, 'program-required'),
	public: z.union([z.boolean(), z.string()]).transform((value) => {
		if (typeof value === 'boolean') {
			return value;
		}

		return value.trim().toLowerCase() !== 'false';
	}),
});

export type CampaignSubmissionFields = z.infer<typeof campaignSubmissionFieldsSchema>;

export type CampaignSubmissionImageValidation = {
	buffer: Buffer;
	mimeType: CampaignSubmissionPermittedImageMimeType;
	filename: string;
	size: number;
};

export type CampaignSubmissionImageSource =
	{ kind: 'upload'; image: CampaignSubmissionImageValidation } | { kind: 'default'; defaultImageId: number };

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

const parseCampaignSubmissionEndDate = (value: string): Date | null => {
	const trimmed = value.trim();
	const date = parse(trimmed, 'yyyy-MM-dd', new Date());
	if (!isValid(date) || format(date, 'yyyy-MM-dd') !== trimmed) {
		return null;
	}

	return startOfDay(date);
};

export const validateCampaignSubmissionEndDate = (endDate: Date): CampaignSubmissionErrorCode | null => {
	const today = startOfDay(new Date());
	const minEndDate = addDays(today, campaignSubmissionConfig.minCampaignDurationDays);
	const maxEndDate = addDays(today, campaignSubmissionConfig.maxCampaignDurationDays);

	if (endDate < minEndDate) {
		return 'end-date-too-soon';
	}

	if (endDate > maxEndDate) {
		return 'end-date-too-late';
	}

	return null;
};

export const endDateFromDurationPreset = (preset: Exclude<CampaignSubmissionDurationPreset, 'other'>): string => {
	const days = campaignSubmissionConfig.durationPresetDays[preset];

	return format(addDays(startOfDay(new Date()), days), 'yyyy-MM-dd');
};

/** Shared size/MIME checks for both client File prechecks and server buffer validation. */
export const validateCampaignSubmissionImageMeta = (size: number, mimeType: string): CampaignSubmissionErrorCode | null => {
	if (size > campaignSubmissionConfig.maxImageBytes) {
		return 'image-too-large';
	}

	if (mimeType && !isPermittedImageMimeType(mimeType)) {
		return 'image-format-unsupported';
	}

	return null;
};

export const validateCampaignSubmissionImageBuffer = (
	buffer: Buffer,
	declaredMimeType: string,
	filename: string,
): { success: true; data: CampaignSubmissionImageValidation } | { success: false; error: CampaignSubmissionErrorCode } => {
	const metaError = validateCampaignSubmissionImageMeta(buffer.length, declaredMimeType);
	if (metaError) {
		return { success: false, error: metaError };
	}

	const detectedMimeType = detectImageMimeType(buffer);
	if (!detectedMimeType) {
		return { success: false, error: 'image-format-unsupported' };
	}

	if (declaredMimeType && isPermittedImageMimeType(declaredMimeType) && declaredMimeType !== detectedMimeType) {
		return { success: false, error: 'image-type-mismatch' };
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
): { success: true; data: CampaignSubmissionFields } | { success: false; error: CampaignSubmissionErrorCode } => {
	const parsed = campaignSubmissionFieldsSchema.safeParse({
		title: formData.get('title'),
		description: formData.get('description'),
		goal: formData.get('goal'),
		currency: formData.get('currency'),
		endDate: formData.get('endDate'),
		programId: formData.get('programId'),
		public: formData.get('public') ?? 'true',
	});

	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message;
		const errorCode =
			message && isCampaignSubmissionErrorCode(message)
				? message
				: ('invalid-submission' satisfies CampaignSubmissionErrorCode);

		return { success: false, error: errorCode };
	}

	const endDateError = validateCampaignSubmissionEndDate(parsed.data.endDate);
	if (endDateError) {
		return { success: false, error: endDateError };
	}

	return { success: true, data: parsed.data };
};

export const parseCampaignSubmissionDefaultImageId = (
	value: FormDataEntryValue | null,
): { success: true; data: number } | { success: false; error: CampaignSubmissionErrorCode } => {
	if (typeof value !== 'string' || !value.trim()) {
		return { success: false, error: 'image-required' };
	}

	const parsed = Number(value.trim());
	if (!Number.isInteger(parsed) || parsed <= 0) {
		return { success: false, error: 'default-image-invalid' };
	}

	return { success: true, data: parsed };
};

export const createCampaignSubmissionFormSchema = (message: (code: CampaignSubmissionErrorCode) => string) =>
	z
		.object({
			title: z
				.string()
				.trim()
				.min(1, message('title-required'))
				.max(campaignSubmissionConfig.maxTitleLength, message('title-too-long'))
				.refine((title) => Boolean(slugify(title)), message('title-not-slugifiable')),
			description: z
				.string()
				.trim()
				.min(1, message('description-required'))
				.max(campaignSubmissionConfig.maxDescriptionLength, message('description-too-long')),
			hasGoal: z.boolean(),
			goal: z.union([z.string(), z.number(), z.undefined(), z.null()]).optional(),
			currency: z.enum(campaignSubmissionConfig.allowedCurrencies, {
				errorMap: () => ({ message: message('currency-unsupported') }),
			}),
			durationPreset: z.enum(campaignSubmissionDurationPresets),
			endDate: z.string(),
			isPublic: z.boolean(),
			programId: z.string().trim().min(1, message('program-required')),
		})
		.superRefine((values, ctx) => {
			if (values.hasGoal) {
				const numericGoal =
					values.goal === undefined || values.goal === null || values.goal === '' ? null : Number(values.goal);
				if (numericGoal === null || !Number.isFinite(numericGoal) || numericGoal <= 0) {
					ctx.addIssue({ code: 'custom', path: ['goal'], message: message('goal-positive') });
				}
			}

			if (values.durationPreset === 'other' || !values.endDate.trim()) {
				if (!values.endDate.trim()) {
					ctx.addIssue({ code: 'custom', path: ['endDate'], message: message('end-date-required') });

					return;
				}
			}

			const date = parseCampaignSubmissionEndDate(values.endDate);
			if (!date) {
				ctx.addIssue({ code: 'custom', path: ['endDate'], message: message('end-date-invalid') });

				return;
			}

			const endDateError = validateCampaignSubmissionEndDate(date);
			if (endDateError) {
				ctx.addIssue({ code: 'custom', path: ['endDate'], message: message(endDateError) });
			}
		});

export const campaignSubmissionDefaultCurrency = Currency.CHF;
