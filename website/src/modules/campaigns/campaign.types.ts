import { parseStoryblokFocus } from '@/components/campaign/campaign-submission/storyblok-image-focus';
import { Currency } from '@/generated/prisma/enums';
import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import {
	campaignSubmissionConfig,
	type CampaignSubmissionDurationPreset,
	type CampaignSubmissionPermittedImageMimeType,
} from '@/lib/config/campaign-submission.config';
import type { Translator } from '@/lib/i18n/translator';
import type { ServiceResult } from '@/lib/service-result';
import { nowMs } from '@/lib/utils/now';
import type { ISbStoryData } from '@storyblok/js';
import { addDays, format, startOfDay } from 'date-fns';
import {
	campaignSubmissionErrorCodeSchema,
	campaignSubmissionFieldsSchema,
	createCampaignSubmissionDetailsSchema,
	createCampaignSubmissionFormSchema,
	createCampaignSubmissionPersonalSchema,
	type CampaignSubmissionErrorCode,
	type CampaignSubmissionFields,
	type CampaignSubmissionFormValues,
} from './campaign.schemas';

export { createCampaignSubmissionDetailsSchema, createCampaignSubmissionFormSchema, createCampaignSubmissionPersonalSchema };

export type { CampaignSubmissionErrorCode, CampaignSubmissionFields, CampaignSubmissionFormValues };

export type CampaignTableViewRow = {
	id: string;
	link: string;
	slug: string;
	title: string;
	currency: Currency;
	endDate: Date;
	isActive: boolean;
	programName: string | null;
	createdAt: Date;
};

export type CampaignTableEntry = Omit<CampaignTableViewRow, 'link' | 'title'> & {
	programPortalSlug: string | null;
};

export type CampaignTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type CampaignPaginatedTableView = {
	tableRows: CampaignTableViewRow[];
	totalCount: number;
};

export type CampaignPage = {
	id: string;
	goal?: number | null;
	currency: Currency;
	additionalAmountChf?: number | null;
	endDate: Date;
	slug?: string | null;
	program: {
		id: string;
		name: string;
	} | null;
	numberOfContributions: number;
	amountCollected: number | null;
	percentageCollected: number | null;
	daysLeft: number;
	createdAt: Date;
};

export type CampaignOption = { id: string; name: string };

export type CampaignReference = {
	id: string;
	slug: string | null;
	endDate: Date;
	programId: string;
};

export type PublicCampaignActivity = 'active' | 'inactive' | 'all';

type PublicCampaignCardImage = {
	filename: string;
	alt: string | null;
	focus: string | null;
};

export type PublicCampaignCard = {
	id: string;
	title: string;
	slug: string;
	creatorName: string | null;
	currency: Currency;
	endDate: Date;
	goal: number | null;
	isActive: boolean;
	primaryImage?: PublicCampaignCardImage | null;
};

export type CampaignCmsJoin = Omit<PublicCampaignCard, 'title' | 'creatorName' | 'primaryImage'>;

export type PublicCampaignStats = {
	contributionsCount: number;
	daysLeft: number;
	amountCollected: number | null;
	percentageCollected: number | null;
};

export type PublicCampaignStatsMap = Record<string, PublicCampaignStats>;

export type PublicCampaignsWithStats = {
	campaigns: PublicCampaignCard[];
	statsById: PublicCampaignStatsMap;
};

export type CampaignCmsJoinWithStats = {
	campaigns: CampaignCmsJoin[];
	statsById: PublicCampaignStatsMap;
};

export type CampaignNewsletterContent = {
	title: string;
	senderName: string;
	imageSrc: string | null;
	imageAlt: string;
};

export type CampaignPageContent = {
	translator: Translator;
	faqs: ISbStoryData<Faq>[];
	videoPlaybackIds: string[];
	newsletter: CampaignNewsletterContent;
};

export type CampaignSubmissionResult = {
	slug: string;
	claimId?: string;
};

export type ClaimPendingCampaignsResult = {
	successfulClaimIds: string[];
	campaignSlug?: string;
};

export type CampaignDefaultImageOption = {
	id: number;
	url: string;
	alt: string | null;
};

export type CampaignReadService = {
	getById: (campaignId: string) => Promise<ServiceResult<CampaignPage>>;
	getFallbackCampaign: () => Promise<ServiceResult<CampaignReference>>;
	getDefaultCampaignForProgram: (programId: string) => Promise<ServiceResult<CampaignReference>>;
};

export const turnstileResponseFieldName = 'cf-turnstile-response';

export const campaignSubmissionDefaultCurrency = Currency.CHF;

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

export const campaignSubmissionPersonalFieldNames = [
	'firstName',
	'lastName',
	'email',
] as const satisfies readonly (keyof CampaignSubmissionFormValues)[];

export const campaignSubmissionAboutFieldNames = [
	'creatorName',
	'quote',
	'hasAdditionalInformation',
	'sectionDescription',
	'instagramHandle',
	'xHandle',
	'linkWebsite',
	'tiktokHandle',
] as const satisfies readonly (keyof CampaignSubmissionFormValues)[];

type CampaignPublicActivityInput = {
	endDate: Date;
	goal?: unknown;
	amountCollected?: number | null;
	now?: number;
};

export const isCampaignActive = ({
	endDate,
	goal,
	amountCollected,
	now = nowMs(),
}: CampaignPublicActivityInput): boolean => {
	if (endDate.getTime() <= now) {
		return false;
	}

	if (goal === null || goal === undefined || amountCollected === null || amountCollected === undefined) {
		return true;
	}

	const goalAmount = Number(goal);
	if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
		return true;
	}

	return amountCollected < goalAmount;
};

export const matchesPublicCampaignActivity = (isActive: boolean, activity: PublicCampaignActivity): boolean => {
	if (activity === 'all') {
		return true;
	}

	return activity === 'active' ? isActive : !isActive;
};

export const campaignSubmissionErrorCodes = campaignSubmissionErrorCodeSchema.options;

export const isCampaignSubmissionErrorCode = (value: string): value is CampaignSubmissionErrorCode =>
	campaignSubmissionErrorCodeSet.has(value);

export const isCampaignSubmissionImageErrorCode = (errorCode: string | undefined): boolean =>
	errorCode === 'image-required' ||
	errorCode === 'image-too-large' ||
	errorCode === 'image-format-unsupported' ||
	errorCode === 'image-type-mismatch' ||
	errorCode === 'default-image-invalid';

const campaignSubmissionErrorCodeSet = new Set<string>(campaignSubmissionErrorCodeSchema.options);

const campaignSubmissionImageMultipartFields = ['primaryImage', 'defaultImageId', 'profilePicture', 'sectionImage'] as const;

export type CampaignSubmissionImageMultipartField = (typeof campaignSubmissionImageMultipartFields)[number];

export const isCampaignSubmissionImageMultipartField = (value: unknown): value is CampaignSubmissionImageMultipartField => {
	if (typeof value !== 'string') {
		return false;
	}

	return campaignSubmissionImageMultipartFields.some((field) => field === value);
};

export type CampaignSubmissionImageValidation = {
	buffer: Buffer;
	mimeType: CampaignSubmissionPermittedImageMimeType;
	filename: string;
	size: number;
	focus?: string | null;
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

const isPermittedImageMimeType = (value: string): value is CampaignSubmissionPermittedImageMimeType =>
	campaignSubmissionConfig.permittedImageMimeTypes.some((mimeType) => mimeType === value);

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

const parseHasAdditionalInformation = (value: FormDataEntryValue | null) =>
	typeof value === 'string' && value.trim().toLowerCase() === 'true';

const sanitizeText = (value: string) =>
	// Intentional: strip ASCII control characters from untrusted text fields.
	// eslint-disable-next-line no-control-regex -- sanitizes form input
	value.replace(/[\u0000-\u001F\u007F]/g, '').trim();

export const resolveCampaignSubmissionQuote = (quote: string, fallback: string) => {
	const sanitizedQuote = sanitizeText(quote);
	if (sanitizedQuote.length > 0) {
		return sanitizedQuote;
	}

	return sanitizeText(fallback);
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

export const validateCampaignSubmissionImageMeta = (size: number, mimeType: string): CampaignSubmissionErrorCode | null => {
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

export const appendCampaignSubmissionFormData = (
	formData: FormData,
	values: CampaignSubmissionFormValues,
	images: AppendCampaignSubmissionFormDataOptions = {},
): FormData => {
	const { includePersonalData = false, ...imageFields } = images;
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

export const readTurnstileToken = (formData: FormData): string | null => {
	const value = formData.get(turnstileResponseFieldName);
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();

	return trimmed.length > 0 ? trimmed : null;
};
