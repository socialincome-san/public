import { Currency } from '@/generated/prisma/enums';
import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import type {
	CampaignSubmissionAllowedCurrency,
	CampaignSubmissionDurationPreset,
	CampaignSubmissionPermittedImageMimeType,
} from '@/lib/config/campaign-submission.config';
import type { Translator } from '@/lib/i18n/translator';
import type { ISbStoryData } from '@storyblok/js';
import type { CampaignSubmissionFields } from './campaign.schemas';

export type { CampaignSubmissionFields };

export type CampaignSubmissionFormValues = {
	title: string;
	description: string;
	hasGoal: boolean;
	goal?: string | number | null;
	currency: CampaignSubmissionAllowedCurrency;
	durationPreset: CampaignSubmissionDurationPreset;
	endDate: string;
	isPublic: boolean;
	programId: string;
	creatorName: string;
	quote: string;
	hasAdditionalInformation: boolean;
	sectionDescription?: string;
	instagramHandle?: string;
	xHandle?: string;
	linkWebsite?: string;
	tiktokHandle?: string;
	firstName: string;
	lastName: string;
	email: string;
};

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
	isActive: boolean;
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
	'slug-exists',
	'submission-failed',
	'turnstile-required',
	'turnstile-invalid',
	'first-name-required',
	'last-name-required',
	'email-required',
	'email-invalid',
] as const;

export type CampaignSubmissionErrorCode = (typeof campaignSubmissionErrorCodes)[number];

export const campaignSubmissionImageMultipartFields = [
	'primaryImage',
	'defaultImageId',
	'profilePicture',
	'sectionImage',
] as const;

export type CampaignSubmissionImageMultipartField = (typeof campaignSubmissionImageMultipartFields)[number];

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
