import {
	campaignSubmissionConfig,
	campaignSubmissionDurationPresets,
	type CampaignSubmissionDurationPreset,
} from '@/lib/config/campaign-submission.config';
import { isSafeHref, slugify } from '@/lib/utils/string-utils';
import {
	campaignSubmissionErrorCodes,
	campaignSubmissionImageMultipartFields,
	type CampaignSubmissionErrorCode,
	type CampaignSubmissionFormValues,
	type CampaignSubmissionImageMultipartField,
} from '@/modules/campaigns/campaign.types';
import { addDays, format, isValid, parse, startOfDay } from 'date-fns';
import { z } from 'zod';

type ErrorMessage = (code: CampaignSubmissionErrorCode) => string;

type AppendCampaignSubmissionFormDataOptions = {
	primaryImage?: File;
	primaryImageFocus?: string | null;
	defaultImageId?: number;
	profilePicture?: File;
	profilePictureFocus?: string | null;
	sectionImage?: File;
	sectionImageFocus?: string | null;
	includePersonalData?: boolean;
};

const SOCIAL_HANDLE_REGEX = /^[a-zA-Z0-9._]+$/;

const sanitizeText = (value: string) =>
	Array.from(value)
		.filter((character) => {
			const code = character.charCodeAt(0);

			return code > 31 && code !== 127;
		})
		.join('')
		.trim();

const optionalSanitizedText = (maxLength: number, tooLongCode: CampaignSubmissionErrorCode, message: ErrorMessage) =>
	z
		.union([z.string(), z.null(), z.undefined()])
		.transform((value) => {
			if (value === null || value === undefined) {
				return null;
			}

			const sanitized = sanitizeText(value);

			return sanitized.length > 0 ? sanitized : null;
		})
		.refine((value) => value === null || value.length <= maxLength, message(tooLongCode));

const normalizeSocialHandle = (value: string) => {
	const sanitized = sanitizeText(value);

	return sanitized.startsWith('@') ? sanitized.slice(1) : sanitized;
};

const isValidSocialHandle = (value: string) => SOCIAL_HANDLE_REGEX.test(value) && !value.includes('..') && value.length > 0;

const optionalSocialHandleSchema = (message: ErrorMessage) =>
	z.union([z.string(), z.null(), z.undefined()]).transform((value, context) => {
		if (value === null || value === undefined) {
			return null;
		}

		const handle = normalizeSocialHandle(value);
		if (handle.length === 0) {
			return null;
		}

		if (handle.length > campaignSubmissionConfig.maxHandleLength) {
			context.addIssue({ code: 'custom', message: message('handle-too-long') });

			return z.NEVER;
		}

		if (!isValidSocialHandle(handle)) {
			context.addIssue({ code: 'custom', message: message('handle-invalid') });

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

const optionalWebsiteUrlSchema = (message: ErrorMessage) =>
	optionalSanitizedText(campaignSubmissionConfig.maxLinkLength, 'link-too-long', message).refine(
		(value) => value === null || isSafeWebsiteUrl(value),
		message('link-unsafe'),
	);

const createAdditionalFieldsSchema = (message: ErrorMessage) =>
	z.object({
		sectionDescription: optionalSanitizedText(
			campaignSubmissionConfig.maxSectionDescriptionLength,
			'section-description-too-long',
			message,
		),
		instagramHandle: optionalSocialHandleSchema(message),
		xHandle: optionalSocialHandleSchema(message),
		linkWebsite: optionalWebsiteUrlSchema(message),
		tiktokHandle: optionalSocialHandleSchema(message),
	});

const parseGoalInput = (value: string | number | null | undefined): number | null | 'invalid' => {
	if (value === null || value === undefined || value === '') {
		return null;
	}

	const numeric = typeof value === 'number' ? value : Number(value);

	return Number.isFinite(numeric) && numeric > 0 ? numeric : 'invalid';
};

const titleRule = (message: ErrorMessage) =>
	z
		.string()
		.min(1, message('title-required'))
		.max(campaignSubmissionConfig.maxTitleLength, message('title-too-long'))
		.refine((title) => Boolean(slugify(title)), message('title-not-slugifiable'));

const descriptionRule = (message: ErrorMessage) =>
	z
		.string()
		.min(1, message('description-required'))
		.max(campaignSubmissionConfig.maxDescriptionLength, message('description-too-long'));

const creatorNameRule = (message: ErrorMessage) =>
	z
		.string()
		.min(1, message('creator-name-required'))
		.max(campaignSubmissionConfig.maxCreatorNameLength, message('creator-name-too-long'));

const quoteRule = (message: ErrorMessage) =>
	z.string().max(campaignSubmissionConfig.maxQuoteLength, message('quote-too-long'));

const programIdRule = (message: ErrorMessage) => z.string().trim().min(1, message('program-required'));

const parseEndDate = (value: string): Date | null => {
	const trimmed = value.trim();
	const date = parse(trimmed, 'yyyy-MM-dd', new Date());

	return isValid(date) && format(date, 'yyyy-MM-dd') === trimmed ? startOfDay(date) : null;
};

const validateEndDate = (endDate: Date): CampaignSubmissionErrorCode | null => {
	const today = startOfDay(new Date());
	const minEndDate = addDays(today, campaignSubmissionConfig.minCampaignDurationDays);
	const maxEndDate = addDays(today, campaignSubmissionConfig.maxCampaignDurationDays);

	if (endDate < minEndDate) {
		return 'end-date-too-soon';
	}

	return endDate > maxEndDate ? 'end-date-too-late' : null;
};

const refineGoalAndEndDate = (
	values: { hasGoal: boolean; goal?: string | number | null; endDate: string },
	context: z.RefinementCtx,
	message: ErrorMessage,
) => {
	if (values.hasGoal) {
		const parsedGoal = parseGoalInput(values.goal);
		if (parsedGoal === null || parsedGoal === 'invalid') {
			context.addIssue({ code: 'custom', path: ['goal'], message: message('goal-positive') });
		}
	}

	if (!values.endDate.trim()) {
		context.addIssue({ code: 'custom', path: ['endDate'], message: message('end-date-required') });

		return;
	}

	const endDate = parseEndDate(values.endDate);
	if (!endDate) {
		context.addIssue({ code: 'custom', path: ['endDate'], message: message('end-date-invalid') });

		return;
	}

	const validationError = validateEndDate(endDate);
	if (validationError) {
		context.addIssue({ code: 'custom', path: ['endDate'], message: message(validationError) });
	}
};

const detailsObjectSchema = (message: ErrorMessage) =>
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

export const createCampaignSubmissionDetailsSchema = (message: ErrorMessage) =>
	detailsObjectSchema(message).superRefine((values, context) => {
		refineGoalAndEndDate(values, context, message);
	});

export const createCampaignSubmissionFormSchema = (message: ErrorMessage) =>
	detailsObjectSchema(message)
		.extend({
			programId: programIdRule(message),
			creatorName: z.string().transform(sanitizeText).pipe(creatorNameRule(message)),
			quote: z.string().transform(sanitizeText).pipe(quoteRule(message)),
			hasAdditionalInformation: z.boolean(),
			sectionDescription: z.string().optional(),
			instagramHandle: z.string().optional(),
			xHandle: z.string().optional(),
			linkWebsite: z.string().optional(),
			tiktokHandle: z.string().optional(),
			firstName: z.string(),
			lastName: z.string(),
			email: z.string(),
		})
		.superRefine((values, context) => {
			refineGoalAndEndDate(values, context, message);

			if (!values.hasAdditionalInformation) {
				return;
			}

			const additionalResult = createAdditionalFieldsSchema(message).safeParse(values);
			if (!additionalResult.success) {
				for (const issue of additionalResult.error.issues) {
					context.addIssue({ code: 'custom', path: issue.path, message: issue.message });
				}
			}
		});

export const createCampaignSubmissionPersonalSchema = (message: ErrorMessage) =>
	z.object({
		firstName: z
			.string()
			.transform(sanitizeText)
			.pipe(z.string().min(1, message('first-name-required'))),
		lastName: z
			.string()
			.transform(sanitizeText)
			.pipe(z.string().min(1, message('last-name-required'))),
		email: z
			.string()
			.transform(sanitizeText)
			.pipe(z.string().min(1, message('email-required')).email(message('email-invalid'))),
	});

export const endDateFromDurationPreset = (preset: Exclude<CampaignSubmissionDurationPreset, 'other'>): string =>
	format(addDays(startOfDay(new Date()), campaignSubmissionConfig.durationPresetDays[preset]), 'yyyy-MM-dd');

export const resolveCampaignSubmissionQuote = (quote: string, fallback: string): string => {
	const sanitizedQuote = sanitizeText(quote);

	return sanitizedQuote.length > 0 ? sanitizedQuote : sanitizeText(fallback);
};

export const validateCampaignSubmissionImageMeta = (size: number, mimeType: string): CampaignSubmissionErrorCode | null => {
	if (size > campaignSubmissionConfig.maxImageBytes) {
		return 'image-too-large';
	}

	const permitted = campaignSubmissionConfig.permittedImageMimeTypes.some((candidate) => candidate === mimeType);

	return mimeType && !permitted ? 'image-format-unsupported' : null;
};

export const isCampaignSubmissionErrorCode = (value: string): value is CampaignSubmissionErrorCode =>
	campaignSubmissionErrorCodes.some((code) => code === value);

export const isCampaignSubmissionImageErrorCode = (errorCodeValue: string | undefined): boolean =>
	errorCodeValue === 'image-required' ||
	errorCodeValue === 'image-too-large' ||
	errorCodeValue === 'image-format-unsupported' ||
	errorCodeValue === 'image-type-mismatch' ||
	errorCodeValue === 'default-image-invalid';

export const isCampaignSubmissionImageMultipartField = (value: unknown): value is CampaignSubmissionImageMultipartField =>
	typeof value === 'string' && campaignSubmissionImageMultipartFields.some((field) => field === value);

export const appendCampaignSubmissionFormData = (
	formData: FormData,
	values: CampaignSubmissionFormValues,
	images: AppendCampaignSubmissionFormDataOptions = {},
): FormData => {
	const { includePersonalData = false, ...imageFields } = images;
	const parsedGoal = values.hasGoal ? parseGoalInput(values.goal) : null;
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

	if (includePersonalData) {
		formData.append('firstName', values.firstName);
		formData.append('lastName', values.lastName);
		formData.append('email', values.email);
	}

	if (imageFields.primaryImage) {
		formData.append('primaryImage', imageFields.primaryImage);
		if (imageFields.primaryImageFocus) {
			formData.append('primaryImageFocus', imageFields.primaryImageFocus);
		}
	} else if (imageFields.defaultImageId !== undefined) {
		formData.append('defaultImageId', String(imageFields.defaultImageId));
	}

	if (imageFields.profilePicture) {
		formData.append('profilePicture', imageFields.profilePicture);
		if (imageFields.profilePictureFocus) {
			formData.append('profilePictureFocus', imageFields.profilePictureFocus);
		}
	}

	if (imageFields.sectionImage) {
		formData.append('sectionImage', imageFields.sectionImage);
		if (imageFields.sectionImageFocus) {
			formData.append('sectionImageFocus', imageFields.sectionImageFocus);
		}
	}

	return formData;
};
