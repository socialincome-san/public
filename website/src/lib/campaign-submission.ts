import { Currency } from '@/generated/prisma/enums';

export const campaignSubmissionDurationPresets = ['30', '90', '365', 'other'] as const;

export type CampaignSubmissionDurationPreset = (typeof campaignSubmissionDurationPresets)[number];

export const campaignSubmissionConfig = {
	storyblokSpaceId: 109655,
	storyblokCampaignsFolderId: 182902215332600,
	storyblokCampaignAssetFolderId: 203259455761804,
	storyblokCampaignDefaultImagesFolderId: 206141857768071,
	maxCampaignDefaultImages: 5,
	permittedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
	maxImageBytes: 5 * 1024 * 1024,
	maxTitleLength: 200,
	maxDescriptionLength: 5000,
	maxCreatorNameLength: 200,
	maxQuoteLength: 1000,
	maxSectionDescriptionLength: 5000,
	maxLinkLength: 500,
	maxHandleLength: 30,
	allowedCurrencies: [Currency.CHF, Currency.EUR, Currency.USD, Currency.GBP] as const,
	minCampaignDurationDays: 7,
	maxCampaignDurationDays: 365,
	// Vercel rejects request bodies over 4.5 MB, so the browser compresses up to three images to fit.
	maxCompressedImageBytes: 1.3 * 1024 * 1024,
	maxMultipartBodyBytes: 4 * 1024 * 1024,
	durationPresetDays: {
		'30': 30,
		'90': 90,
		'365': 365,
	} as const satisfies Record<Exclude<CampaignSubmissionDurationPreset, 'other'>, number>,
} as const;

export type CampaignSubmissionPermittedImageMimeType = (typeof campaignSubmissionConfig.permittedImageMimeTypes)[number];

export type CampaignSubmissionAllowedCurrency = (typeof campaignSubmissionConfig.allowedCurrencies)[number];
