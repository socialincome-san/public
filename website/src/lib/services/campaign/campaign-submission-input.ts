import { Currency } from '@/generated/prisma/enums';
import {
	campaignSubmissionConfig,
	campaignSubmissionDurationPresets,
	type CampaignSubmissionAllowedCurrency,
	type CampaignSubmissionDurationPreset,
	type CampaignSubmissionPermittedImageMimeType,
} from '@/lib/config/campaign-submission.config';
import { isSafeHref, slugify } from '@/lib/utils/string-utils';
import { addDays, format, isValid, parse, startOfDay } from 'date-fns';
import z from 'zod';

// Intentional: strip ASCII control characters from untrusted text fields.
// eslint-disable-next-line no-control-regex -- sanitizes form input
const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001F\u007F]/;
const SOCIAL_HANDLE_REGEX = /^[a-zA-Z0-9._]+$/;

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
	'creator-name-required',
	'creator-name-too-long',
	'quote-required',
	'quote-too-long',
	'section-description-too-long',
	'link-too-long',
	'link-unsafe',
	'handle-invalid',
	'handle-too-long',
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

type ErrorMessage = (code: CampaignSubmissionErrorCode) => string;

const asErrorCode: ErrorMessage = (code) => code;

const campaignSubmissionImageMultipartFields = ['primaryImage', 'defaultImageId', 'profilePicture', 'sectionImage'] as const;

export type CampaignSubmissionImageMultipartField = (typeof campaignSubmissionImageMultipartFields)[number];

export const isCampaignSubmissionImageMultipartField = (value: unknown): value is CampaignSubmissionImageMultipartField =>
	typeof value === 'string' && (campaignSubmissionImageMultipartFields as readonly string[]).includes(value);

export const isCampaignSubmissionImageErrorCode = (errorCode: string | undefined): boolean =>
	errorCode === 'image-required' ||
	errorCode === 'image-too-large' ||
	errorCode === 'image-format-unsupported' ||
	errorCode === 'image-type-mismatch' ||
	errorCode === 'default-image-invalid';

const campaignSubmissionErrorCodeSet = new Set<string>(campaignSubmissionErrorCodes);

export const isCampaignSubmissionErrorCode = (value: string): value is CampaignSubmissionErrorCode =>
	campaignSubmissionErrorCodeSet.has(value);

export type CampaignSubmissionWirePayload = {
	title: string;
	description: string;
	goal: number | null;
	currency: CampaignSubmissionAllowedCurrency;
	endDate: string;
	programId: string;
	public: boolean;
	creatorName: string;
	quote: string;
	hasAdditionalInformation: boolean;
	sectionDescription: string | null;
	instagramHandle: string | null;
	xHandle: string | null;
	linkWebsite: string | null;
	tiktokHandle: string | null;
};

export type CampaignSubmissionWireImages = {
	primaryImage?: File;
	defaultImageId?: number;
	profilePicture?: File;
	sectionImage?: File;
};

const sanitizeText = (value: string) => value.replace(CONTROL_CHARACTERS_REGEX, '').trim();

const optionalSanitizedText = (maxLength: number, tooLongCode: CampaignSubmissionErrorCode) =>
	z
		.union([z.string(), z.null(), z.undefined()])
		.transform((value) => {
			if (value === null || value === undefined) {
				return null;
			}

			const sanitized = sanitizeText(value);

			return sanitized.length > 0 ? sanitized : null;
		})
		.refine((value) => value === null || value.length <= maxLength, tooLongCode);

const normalizeSocialHandle = (value: string) => {
	const sanitized = sanitizeText(value);

	return sanitized.startsWith('@') ? sanitized.slice(1) : sanitized;
};

const isValidSocialHandle = (value: string) => SOCIAL_HANDLE_REGEX.test(value) && !value.includes('..') && value.length > 0;

const optionalSocialHandle = () =>
	z.union([z.string(), z.null(), z.undefined()]).transform((value, ctx) => {
		if (value === null || value === undefined) {
			return null;
		}

		const handle = normalizeSocialHandle(value);
		if (handle.length === 0) {
			return null;
		}

		if (handle.length > campaignSubmissionConfig.maxHandleLength) {
			ctx.addIssue({ code: 'custom', message: 'handle-too-long' });

			return z.NEVER;
		}

		if (!isValidSocialHandle(handle)) {
			ctx.addIssue({ code: 'custom', message: 'handle-invalid' });

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

const optionalWebsiteUrl = () =>
	optionalSanitizedText(campaignSubmissionConfig.maxLinkLength, 'link-too-long').refine(
		(value) => value === null || isSafeWebsiteUrl(value),
		'link-unsafe',
	);

const isAllowedCurrency = (value: string): value is CampaignSubmissionAllowedCurrency =>
	campaignSubmissionConfig.allowedCurrencies.includes(value as CampaignSubmissionAllowedCurrency);

const isPermittedImageMimeType = (value: string): value is CampaignSubmissionPermittedImageMimeType =>
	campaignSubmissionConfig.permittedImageMimeTypes.includes(value as CampaignSubmissionPermittedImageMimeType);

const parseHasAdditionalInformation = (value: FormDataEntryValue | null) =>
	typeof value === 'string' && value.trim().toLowerCase() === 'true';

/** Shared goal parsing for client form checks and server FormData coercion. */
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

const quoteRule = (msg: ErrorMessage) =>
	z.string().min(1, msg('quote-required')).max(campaignSubmissionConfig.maxQuoteLength, msg('quote-too-long'));

const programIdRule = (msg: ErrorMessage) => z.string().trim().min(1, msg('program-required'));

const validateClientSectionDescription = (value: string | undefined): CampaignSubmissionErrorCode | null => {
	const sectionDescription = value?.trim() ?? '';
	if (sectionDescription.length > campaignSubmissionConfig.maxSectionDescriptionLength) {
		return 'section-description-too-long';
	}

	return null;
};

const validateClientWebsiteUrl = (value: string | undefined): CampaignSubmissionErrorCode | null => {
	const website = value?.trim() ?? '';
	if (!website) {
		return null;
	}

	if (website.length > campaignSubmissionConfig.maxLinkLength) {
		return 'link-too-long';
	}

	if (!isSafeWebsiteUrl(website)) {
		return 'link-unsafe';
	}

	return null;
};

const validateClientSocialHandle = (value: string | undefined): CampaignSubmissionErrorCode | null => {
	const rawHandle = value?.trim() ?? '';
	if (!rawHandle) {
		return null;
	}

	const handle = normalizeSocialHandle(rawHandle);
	if (handle.length > campaignSubmissionConfig.maxHandleLength) {
		return 'handle-too-long';
	}

	if (!isValidSocialHandle(handle)) {
		return 'handle-invalid';
	}

	return null;
};

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
		// Parse YYYY-MM-DD as a local calendar day (z.coerce.date uses UTC midnight and breaks min/max checks).
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
		),
		instagramHandle: optionalSocialHandle(),
		xHandle: optionalSocialHandle(),
		linkWebsite: optionalWebsiteUrl(),
		tiktokHandle: optionalSocialHandle(),
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

export type CampaignSubmissionImageValidation = {
	buffer: Buffer;
	mimeType: CampaignSubmissionPermittedImageMimeType;
	filename: string;
	size: number;
};

export type CampaignSubmissionImageSource =
	{ kind: 'upload'; image: CampaignSubmissionImageValidation } | { kind: 'default'; defaultImageId: number };

export type CampaignSubmissionOptionalImages = {
	profilePicture: CampaignSubmissionImageValidation | null;
	sectionImage: CampaignSubmissionImageValidation | null;
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

export const parseCampaignSubmissionFields = (
	formData: FormData,
): { success: true; data: CampaignSubmissionFields } | { success: false; error: CampaignSubmissionErrorCode } => {
	const parsed = campaignSubmissionFieldsSchema.safeParse(readCampaignSubmissionFormDataFields(formData));

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

	const imageBuffer = Buffer.from(await imageField.arrayBuffer());
	const imageResult = validateCampaignSubmissionImageBuffer(imageBuffer, imageField.type, imageField.name);
	if (!imageResult.success) {
		return { success: false, error: imageResult.error };
	}

	return {
		success: true,
		data: imageResult.data,
	};
};

export const createCampaignSubmissionFormSchema = (message: (code: CampaignSubmissionErrorCode) => string) =>
	z
		.object({
			title: z.string().trim().pipe(titleRule(message)),
			description: z.string().trim().pipe(descriptionRule(message)),
			hasGoal: z.boolean(),
			goal: z.union([z.string(), z.number(), z.undefined(), z.null()]).optional(),
			currency: z.enum(campaignSubmissionConfig.allowedCurrencies, {
				errorMap: () => ({ message: message('currency-unsupported') }),
			}),
			durationPreset: z.enum(campaignSubmissionDurationPresets),
			endDate: z.string(),
			isPublic: z.boolean(),
			programId: programIdRule(message),
			creatorName: z.string().trim().pipe(creatorNameRule(message)),
			quote: z.string().trim().pipe(quoteRule(message)),
			hasAdditionalInformation: z.boolean(),
			sectionDescription: z.string().optional(),
			instagramHandle: z.string().optional(),
			xHandle: z.string().optional(),
			linkWebsite: z.string().optional(),
			tiktokHandle: z.string().optional(),
		})
		.superRefine((values, ctx) => {
			if (values.hasGoal) {
				const parsedGoal = parseCampaignSubmissionGoalInput(values.goal === undefined ? null : values.goal);
				if (parsedGoal === null || parsedGoal === 'invalid') {
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

			if (!values.hasAdditionalInformation) {
				return;
			}

			const sectionDescriptionError = validateClientSectionDescription(values.sectionDescription);
			if (sectionDescriptionError) {
				ctx.addIssue({
					code: 'custom',
					path: ['sectionDescription'],
					message: message(sectionDescriptionError),
				});
			}

			const websiteError = validateClientWebsiteUrl(values.linkWebsite);
			if (websiteError) {
				ctx.addIssue({ code: 'custom', path: ['linkWebsite'], message: message(websiteError) });
			}

			for (const path of ['instagramHandle', 'xHandle', 'tiktokHandle'] as const) {
				const handleError = validateClientSocialHandle(values[path]);
				if (handleError) {
					ctx.addIssue({ code: 'custom', path: [path], message: message(handleError) });
				}
			}
		});

export type CampaignSubmissionFormValues = z.infer<ReturnType<typeof createCampaignSubmissionFormSchema>>;

export const toCampaignSubmissionWirePayload = (values: CampaignSubmissionFormValues): CampaignSubmissionWirePayload => {
	const parsedGoal = values.hasGoal
		? parseCampaignSubmissionGoalInput(values.goal === undefined ? null : values.goal)
		: null;
	const goal = parsedGoal === 'invalid' || parsedGoal === null ? null : parsedGoal;

	if (!values.hasAdditionalInformation) {
		return {
			title: values.title,
			description: values.description,
			goal,
			currency: values.currency,
			endDate: values.endDate,
			programId: values.programId,
			public: values.isPublic,
			creatorName: values.creatorName,
			quote: values.quote,
			hasAdditionalInformation: false,
			sectionDescription: null,
			instagramHandle: null,
			xHandle: null,
			linkWebsite: null,
			tiktokHandle: null,
		};
	}

	return {
		title: values.title,
		description: values.description,
		goal,
		currency: values.currency,
		endDate: values.endDate,
		programId: values.programId,
		public: values.isPublic,
		creatorName: values.creatorName,
		quote: values.quote,
		hasAdditionalInformation: true,
		sectionDescription: values.sectionDescription?.trim() ? values.sectionDescription : null,
		instagramHandle: values.instagramHandle?.trim() ? values.instagramHandle : null,
		xHandle: values.xHandle?.trim() ? values.xHandle : null,
		linkWebsite: values.linkWebsite?.trim() ? values.linkWebsite : null,
		tiktokHandle: values.tiktokHandle?.trim() ? values.tiktokHandle : null,
	};
};

export const appendCampaignSubmissionFormData = (
	formData: FormData,
	payload: CampaignSubmissionWirePayload,
	images: CampaignSubmissionWireImages = {},
): FormData => {
	formData.append('title', payload.title);
	formData.append('description', payload.description);
	formData.append('goal', payload.goal === null ? '' : String(payload.goal));
	formData.append('currency', payload.currency);
	formData.append('endDate', payload.endDate);
	formData.append('programId', payload.programId);
	formData.append('public', payload.public ? 'true' : 'false');
	formData.append('creatorName', payload.creatorName);
	formData.append('quote', payload.quote);
	formData.append('hasAdditionalInformation', payload.hasAdditionalInformation ? 'true' : 'false');

	if (payload.hasAdditionalInformation) {
		formData.append('sectionDescription', payload.sectionDescription ?? '');
		formData.append('instagramHandle', payload.instagramHandle ?? '');
		formData.append('xHandle', payload.xHandle ?? '');
		formData.append('linkWebsite', payload.linkWebsite ?? '');
		formData.append('tiktokHandle', payload.tiktokHandle ?? '');
	}

	if (images.primaryImage) {
		formData.append('primaryImage', images.primaryImage);
	} else if (images.defaultImageId !== undefined) {
		formData.append('defaultImageId', String(images.defaultImageId));
	}

	if (images.profilePicture) {
		formData.append('profilePicture', images.profilePicture);
	}

	if (images.sectionImage) {
		formData.append('sectionImage', images.sectionImage);
	}

	return formData;
};

export const campaignSubmissionDetailsFieldNames = [
	'title',
	'description',
	'hasGoal',
	'goal',
	'currency',
	'durationPreset',
	'endDate',
	'isPublic',
	'programId',
] as const;

export const campaignSubmissionDefaultCurrency = Currency.CHF;
