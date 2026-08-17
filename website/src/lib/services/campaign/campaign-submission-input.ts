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

export type CampaignSubmissionFormImages = {
	primaryImage?: File;
	defaultImageId?: number;
	profilePicture?: File;
	sectionImage?: File;
};

const sanitizeText = (value: string) => value.replace(CONTROL_CHARACTERS_REGEX, '').trim();

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

const createCampaignSubmissionAdditionalFieldsSchema = (msg: ErrorMessage) =>
	z.object({
		sectionDescription: optionalSanitizedText(
			campaignSubmissionConfig.maxSectionDescriptionLength,
			'section-description-too-long',
			msg,
		),
		instagramHandle: optionalSocialHandleSchema(msg),
		xHandle: optionalSocialHandleSchema(msg),
		linkWebsite: optionalWebsiteUrlSchema(msg),
		tiktokHandle: optionalSocialHandleSchema(msg),
	});

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

/** Client-side quote may be empty; the form fills the placeholder before submit. */
const optionalClientQuoteRule = (msg: ErrorMessage) =>
	z.string().max(campaignSubmissionConfig.maxQuoteLength, msg('quote-too-long'));

const programIdRule = (msg: ErrorMessage) => z.string().trim().min(1, msg('program-required'));

export const resolveCampaignSubmissionQuote = (quote: string, fallback: string) => {
	const sanitizedQuote = sanitizeText(quote);
	if (sanitizedQuote.length > 0) {
		return sanitizedQuote;
	}

	return sanitizeText(fallback);
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

const refineCampaignSubmissionGoalAndEndDate = (
	values: {
		hasGoal: boolean;
		goal?: string | number | null;
		endDate: string;
	},
	ctx: z.RefinementCtx,
	message: ErrorMessage,
) => {
	if (values.hasGoal) {
		const parsedGoal = parseCampaignSubmissionGoalInput(values.goal === undefined ? null : values.goal);
		if (parsedGoal === null || parsedGoal === 'invalid') {
			ctx.addIssue({ code: 'custom', path: ['goal'], message: message('goal-positive') });
		}
	}

	if (!values.endDate.trim()) {
		ctx.addIssue({ code: 'custom', path: ['endDate'], message: message('end-date-required') });

		return;
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
};

const campaignSubmissionDetailsObjectSchema = (message: ErrorMessage) =>
	z.object({
		title: z.string().transform(sanitizeText).pipe(titleRule(message)),
		description: z.string().transform(sanitizeText).pipe(descriptionRule(message)),
		hasGoal: z.boolean(),
		goal: z.union([z.string(), z.number(), z.undefined(), z.null()]).optional(),
		currency: z.enum(campaignSubmissionConfig.allowedCurrencies, {
			errorMap: () => ({ message: message('currency-unsupported') }),
		}),
		durationPreset: z.enum(campaignSubmissionDurationPresets),
		endDate: z.string(),
		isPublic: z.boolean(),
	});

/** Validates only the details step — safe to run before about-step fields are filled. */
export const createCampaignSubmissionDetailsSchema = (message: (code: CampaignSubmissionErrorCode) => string) =>
	campaignSubmissionDetailsObjectSchema(message).superRefine((values, ctx) => {
		refineCampaignSubmissionGoalAndEndDate(values, ctx, message);
	});

export const createCampaignSubmissionFormSchema = (message: (code: CampaignSubmissionErrorCode) => string) =>
	campaignSubmissionDetailsObjectSchema(message)
		.extend({
			programId: programIdRule(message),
			creatorName: z.string().transform(sanitizeText).pipe(creatorNameRule(message)),
			quote: z.string().transform(sanitizeText).pipe(optionalClientQuoteRule(message)),
			hasAdditionalInformation: z.boolean(),
			sectionDescription: z.string().optional(),
			instagramHandle: z.string().optional(),
			xHandle: z.string().optional(),
			linkWebsite: z.string().optional(),
			tiktokHandle: z.string().optional(),
		})
		.superRefine((values, ctx) => {
			refineCampaignSubmissionGoalAndEndDate(values, ctx, message);

			if (!values.hasAdditionalInformation) {
				return;
			}

			const additionalResult = createCampaignSubmissionAdditionalFieldsSchema(message).safeParse({
				sectionDescription: values.sectionDescription,
				instagramHandle: values.instagramHandle,
				xHandle: values.xHandle,
				linkWebsite: values.linkWebsite,
				tiktokHandle: values.tiktokHandle,
			});

			if (!additionalResult.success) {
				for (const issue of additionalResult.error.issues) {
					ctx.addIssue({
						code: 'custom',
						path: issue.path,
						message: issue.message,
					});
				}
			}
		});

export type CampaignSubmissionFormValues = z.infer<ReturnType<typeof createCampaignSubmissionFormSchema>>;

export const campaignSubmissionDetailsFieldNames = [
	'title',
	'description',
	'hasGoal',
	'goal',
	'currency',
	'durationPreset',
	'endDate',
	'isPublic',
] as const satisfies readonly (keyof CampaignSubmissionFormValues)[];

export const appendCampaignSubmissionFormData = (
	formData: FormData,
	values: CampaignSubmissionFormValues,
	images: CampaignSubmissionFormImages = {},
): FormData => {
	const parsedGoal = values.hasGoal
		? parseCampaignSubmissionGoalInput(values.goal === undefined ? null : values.goal)
		: null;
	const goal = parsedGoal === 'invalid' || parsedGoal === null ? null : parsedGoal;

	formData.append('title', values.title);
	formData.append('description', values.description);
	formData.append('goal', goal === null ? '' : String(goal));
	formData.append('currency', values.currency);
	formData.append('endDate', values.endDate);
	formData.append('programId', values.programId);
	formData.append('public', values.isPublic ? 'true' : 'false');
	formData.append('creatorName', values.creatorName);
	formData.append('quote', values.quote);
	formData.append('hasAdditionalInformation', values.hasAdditionalInformation ? 'true' : 'false');

	if (values.hasAdditionalInformation) {
		formData.append('sectionDescription', values.sectionDescription ?? '');
		formData.append('instagramHandle', values.instagramHandle ?? '');
		formData.append('xHandle', values.xHandle ?? '');
		formData.append('linkWebsite', values.linkWebsite ?? '');
		formData.append('tiktokHandle', values.tiktokHandle ?? '');
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

export const campaignSubmissionDefaultCurrency = Currency.CHF;
