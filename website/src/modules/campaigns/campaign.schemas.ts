import {
	campaignSubmissionConfig,
	campaignSubmissionDurationPresets,
	type CampaignSubmissionAllowedCurrency,
} from '@/lib/config/campaign-submission.config';
import { isSafeHref, slugify } from '@/lib/utils/string-utils';
import { addDays, format, isValid, parse, startOfDay } from 'date-fns';
import z from 'zod';

export const campaignSubmissionErrorCodeSchema = z.enum([
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
	'slug-exists',
	'submission-failed',
	'turnstile-required',
	'turnstile-invalid',
	'first-name-required',
	'last-name-required',
	'email-required',
	'email-invalid',
]);

export type CampaignSubmissionErrorCode = z.infer<typeof campaignSubmissionErrorCodeSchema>;

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

// Intentional: strip ASCII control characters from untrusted text fields.
// eslint-disable-next-line no-control-regex -- sanitizes form input
const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001F\u007F]/;
const SOCIAL_HANDLE_REGEX = /^[a-zA-Z0-9._]+$/;

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

const optionalClientQuoteRule = (msg: ErrorMessage) =>
	z.string().max(campaignSubmissionConfig.maxQuoteLength, msg('quote-too-long'));

const programIdRule = (msg: ErrorMessage) => z.string().trim().min(1, msg('program-required'));

export const campaignSubmissionFieldsSchema = z
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

const validateCampaignSubmissionEndDate = (endDate: Date): CampaignSubmissionErrorCode | null => {
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
			firstName: z.string(),
			lastName: z.string(),
			email: z.string(),
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

export const createCampaignSubmissionPersonalSchema = (message: (code: CampaignSubmissionErrorCode) => string) =>
	z.object({
		firstName: z.string().transform(sanitizeText).pipe(firstNameRule(message)),
		lastName: z.string().transform(sanitizeText).pipe(lastNameRule(message)),
		email: z.string().transform(sanitizeText).pipe(emailRule(message)),
	});

export type CampaignSubmissionFormValues = z.infer<ReturnType<typeof createCampaignSubmissionFormSchema>>;
