import {
	campaignSubmissionConfig,
	type CampaignSubmissionAllowedCurrency,
	type CampaignSubmissionPermittedImageMimeType,
} from '@/lib/config/campaign-submission.config';
import { parseStoryblokFocus } from '@/lib/storyblok/storyblok-image-focus';
import { isSafeHref, slugify } from '@/lib/utils/string-utils';
import { addDays, format, isValid, parse, startOfDay } from 'date-fns';
import z from 'zod';
import {
	campaignSubmissionErrorCodes,
	turnstileResponseFieldName,
	type CampaignSubmissionErrorCode,
	type CampaignSubmissionImageValidation,
} from './campaign.types';

export const campaignIdSchema = z.string().trim().min(1, 'Missing campaign id');

export const campaignPortalSlugSchema = z.string().trim().min(1, 'Missing campaign slug');

export const campaignClaimIdsSchema = z
	.array(z.unknown())
	.transform((values) => values.filter((value): value is string => typeof value === 'string'));

export const campaignPublicLanguageSchema = z.string();

export const campaignActivitySchema = z.enum(['active', 'inactive', 'all']);

export const campaignProgramIdSchema = z.string().trim().min(1, 'Missing program id');

type ErrorMessage = (code: CampaignSubmissionErrorCode) => string;

const asErrorCode: ErrorMessage = (code) => code;

const SOCIAL_HANDLE_REGEX = /^[a-zA-Z0-9._]+$/;

const sanitizeText = (value: string) =>
	Array.from(value)
		.filter((character) => {
			const code = character.charCodeAt(0);

			return code > 31 && code !== 127;
		})
		.join('')
		.trim();

const optionalSanitizedText = (maxLength: number, tooLongCode: CampaignSubmissionErrorCode, msg: ErrorMessage) =>
	z
		.union([z.string(), z.null(), z.undefined()])
		.transform((value) => {
			if (value === null || value === undefined) {
				return null;
			}

			const sanitized = sanitizeText(value);

			return sanitized.length > 0 ? sanitized : null;
		})
		.refine((value) => value === null || value.length <= maxLength, msg(tooLongCode));

const normalizeSocialHandle = (value: string) => {
	const sanitized = sanitizeText(value);

	return sanitized.startsWith('@') ? sanitized.slice(1) : sanitized;
};

const isValidSocialHandle = (value: string) => SOCIAL_HANDLE_REGEX.test(value) && !value.includes('..') && value.length > 0;

const optionalSocialHandleSchema = (msg: ErrorMessage) =>
	z.union([z.string(), z.null(), z.undefined()]).transform((value, ctx) => {
		if (value === null || value === undefined) {
			return null;
		}

		const handle = normalizeSocialHandle(value);
		if (handle.length === 0) {
			return null;
		}

		if (handle.length > campaignSubmissionConfig.maxHandleLength) {
			ctx.addIssue({ code: 'custom', message: msg('handle-too-long') });

			return z.NEVER;
		}

		if (!isValidSocialHandle(handle)) {
			ctx.addIssue({ code: 'custom', message: msg('handle-invalid') });

			return z.NEVER;
		}

		return handle;
	});

const isSafeWebsiteUrl = (value: string) => {
	if (!isSafeHref(value)) {
		return false;
	}

	try {
		const protocol = new URL(value).protocol.toLowerCase();

		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
};

const optionalWebsiteUrlSchema = (msg: ErrorMessage) =>
	optionalSanitizedText(campaignSubmissionConfig.maxLinkLength, 'link-too-long', msg).refine(
		(value) => value === null || isSafeWebsiteUrl(value),
		msg('link-unsafe'),
	);

const isAllowedCurrency = (value: string): value is CampaignSubmissionAllowedCurrency =>
	campaignSubmissionConfig.allowedCurrencies.some((currency) => currency === value);

const parseCampaignSubmissionGoalInput = (value: string | number | null | undefined): number | null | 'invalid' => {
	if (value === null || value === undefined || value === '') {
		return null;
	}

	const numeric = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) {
		return 'invalid';
	}

	return numeric;
};

const titleRule = (msg: ErrorMessage) =>
	z
		.string()
		.min(1, msg('title-required'))
		.max(campaignSubmissionConfig.maxTitleLength, msg('title-too-long'))
		.refine((title) => Boolean(slugify(title)), msg('title-not-slugifiable'));

const descriptionRule = (msg: ErrorMessage) =>
	z
		.string()
		.min(1, msg('description-required'))
		.max(campaignSubmissionConfig.maxDescriptionLength, msg('description-too-long'));

const creatorNameRule = (msg: ErrorMessage) =>
	z
		.string()
		.min(1, msg('creator-name-required'))
		.max(campaignSubmissionConfig.maxCreatorNameLength, msg('creator-name-too-long'));

const firstNameRule = (msg: ErrorMessage) => z.string().min(1, msg('first-name-required'));

const lastNameRule = (msg: ErrorMessage) => z.string().min(1, msg('last-name-required'));

const emailRule = (msg: ErrorMessage) => z.string().min(1, msg('email-required')).email(msg('email-invalid'));

const quoteRule = (msg: ErrorMessage) =>
	z.string().min(1, msg('quote-required')).max(campaignSubmissionConfig.maxQuoteLength, msg('quote-too-long'));

const programIdRule = (msg: ErrorMessage) => z.string().trim().min(1, msg('program-required'));

const campaignSubmissionFieldsSchema = z
	.object({
		title: z.string().transform(sanitizeText).pipe(titleRule(asErrorCode)),
		description: z.string().transform(sanitizeText).pipe(descriptionRule(asErrorCode)),
		goal: z.union([z.string(), z.number(), z.null()]).transform((value, ctx) => {
			const parsed = parseCampaignSubmissionGoalInput(value);
			if (parsed === 'invalid') {
				ctx.addIssue({ code: 'custom', message: 'goal-positive' });

				return z.NEVER;
			}

			return parsed;
		}),
		currency: z
			.string()
			.transform((value) => value.trim().toUpperCase())
			.refine(isAllowedCurrency, 'currency-unsupported'),
		endDate: z.string().transform((value, ctx) => {
			const date = parseCampaignSubmissionEndDate(value);
			if (!date) {
				ctx.addIssue({ code: 'custom', message: 'end-date-invalid' });

				return z.NEVER;
			}

			return date;
		}),
		programId: programIdRule(asErrorCode),
		public: z.union([z.boolean(), z.string()]).transform((value) => {
			if (typeof value === 'boolean') {
				return value;
			}

			return value.trim().toLowerCase() === 'true';
		}),
		creatorName: z.string().transform(sanitizeText).pipe(creatorNameRule(asErrorCode)),
		quote: z.string().transform(sanitizeText).pipe(quoteRule(asErrorCode)),
		hasAdditionalInformation: z.boolean(),
		sectionDescription: optionalSanitizedText(
			campaignSubmissionConfig.maxSectionDescriptionLength,
			'section-description-too-long',
			asErrorCode,
		),
		instagramHandle: optionalSocialHandleSchema(asErrorCode),
		xHandle: optionalSocialHandleSchema(asErrorCode),
		linkWebsite: optionalWebsiteUrlSchema(asErrorCode),
		tiktokHandle: optionalSocialHandleSchema(asErrorCode),
	})
	.transform((values) => {
		if (values.hasAdditionalInformation) {
			return values;
		}

		return {
			...values,
			sectionDescription: null,
			instagramHandle: null,
			xHandle: null,
			linkWebsite: null,
			tiktokHandle: null,
		};
	});

export type CampaignSubmissionFields = z.infer<typeof campaignSubmissionFieldsSchema>;

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

export const createCampaignSubmissionPersonalSchema = (message: (code: CampaignSubmissionErrorCode) => string) =>
	z.object({
		firstName: z.string().transform(sanitizeText).pipe(firstNameRule(message)),
		lastName: z.string().transform(sanitizeText).pipe(lastNameRule(message)),
		email: z.string().transform(sanitizeText).pipe(emailRule(message)),
	});

export const isCampaignSubmissionErrorCode = (value: string): value is CampaignSubmissionErrorCode =>
	campaignSubmissionErrorCodes.some((code) => code === value);

export const isCampaignSubmissionImageErrorCode = (errorCode: string | undefined): boolean =>
	errorCode === 'image-required' ||
	errorCode === 'image-too-large' ||
	errorCode === 'image-format-unsupported' ||
	errorCode === 'image-type-mismatch' ||
	errorCode === 'default-image-invalid';

const validateCampaignSubmissionImageMeta = (size: number, mimeType: string): CampaignSubmissionErrorCode | null => {
	if (size > campaignSubmissionConfig.maxImageBytes) {
		return 'image-too-large';
	}

	if (mimeType && !isPermittedImageMimeType(mimeType)) {
		return 'image-format-unsupported';
	}

	return null;
};

export const parseCampaignSubmissionImageFocus = (
	value: FormDataEntryValue | null | undefined,
): { success: true; data: string | null } | { success: false; error: CampaignSubmissionErrorCode } => {
	if (value === null || value === undefined) {
		return { success: true, data: null };
	}

	if (typeof value !== 'string') {
		return { success: false, error: 'invalid-submission' };
	}

	const trimmed = value.trim();
	if (trimmed.length === 0) {
		return { success: true, data: null };
	}

	if (!parseStoryblokFocus(trimmed)) {
		return { success: false, error: 'invalid-submission' };
	}

	return { success: true, data: trimmed };
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
	const parsed = campaignSubmissionFieldsSchema.safeParse(readCampaignSubmissionFormDataFields(formData));

	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message;
		const errorCode = message && isCampaignSubmissionErrorCode(message) ? message : 'invalid-submission';

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

export const parseCampaignSubmissionImageFile = async (
	file: File,
): Promise<
	{ success: true; data: CampaignSubmissionImageValidation } | { success: false; error: CampaignSubmissionErrorCode }
> => {
	const imageBuffer = Buffer.from(await file.arrayBuffer());

	return validateCampaignSubmissionImageBuffer(imageBuffer, file.type, file.name);
};

export const parseOptionalCampaignSubmissionImage = async (
	formData: FormData,
	fieldName: string,
): Promise<
	{ success: true; data: CampaignSubmissionImageValidation | null } | { success: false; error: CampaignSubmissionErrorCode }
> => {
	const imageField = formData.get(fieldName);
	if (!(imageField instanceof File) || imageField.size === 0) {
		return { success: true, data: null };
	}

	const imageResult = await parseCampaignSubmissionImageFile(imageField);
	if (!imageResult.success) {
		return { success: false, error: imageResult.error };
	}

	return {
		success: true,
		data: imageResult.data,
	};
};

export const readTurnstileToken = (formData: FormData): string | null => {
	const value = formData.get(turnstileResponseFieldName);
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();

	return trimmed.length > 0 ? trimmed : null;
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

const isPermittedImageMimeType = (value: string): value is CampaignSubmissionPermittedImageMimeType =>
	campaignSubmissionConfig.permittedImageMimeTypes.some((mimeType) => mimeType === value);

const parseHasAdditionalInformation = (value: FormDataEntryValue | null) =>
	typeof value === 'string' && value.trim().toLowerCase() === 'true';

const readCampaignSubmissionFormDataFields = (formData: FormData) => ({
	title: formData.get('title'),
	description: formData.get('description'),
	goal: formData.get('goal'),
	currency: formData.get('currency'),
	endDate: formData.get('endDate'),
	programId: formData.get('programId'),
	public: formData.get('public') ?? 'true',
	creatorName: formData.get('creatorName') ?? '',
	quote: formData.get('quote') ?? '',
	hasAdditionalInformation: parseHasAdditionalInformation(formData.get('hasAdditionalInformation')),
	sectionDescription: formData.get('sectionDescription'),
	instagramHandle: formData.get('instagramHandle'),
	xHandle: formData.get('xHandle'),
	linkWebsite: formData.get('linkWebsite'),
	tiktokHandle: formData.get('tiktokHandle'),
});
