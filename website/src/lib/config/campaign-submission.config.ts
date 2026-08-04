import { Currency } from '@/generated/prisma/enums';

export const campaignSubmissionConfig = {
	storyblokSpaceId: 109655,
	storyblokCampaignsFolderId: 182902215332600,
	storyblokCampaignAssetFolderId: 203259455761804,
	permittedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
	maxImageBytes: 5 * 1024 * 1024,
	maxTitleLength: 200,
	maxDescriptionLength: 5000,
	allowedCurrencies: [Currency.CHF, Currency.EUR, Currency.USD, Currency.GBP] as const,
	minCampaignDurationDays: 7,
	maxCampaignDurationDays: 365,
	maxMultipartBodyBytes: 6 * 1024 * 1024,
} as const;

export type CampaignSubmissionPermittedImageMimeType = (typeof campaignSubmissionConfig.permittedImageMimeTypes)[number];

export type CampaignSubmissionAllowedCurrency = (typeof campaignSubmissionConfig.allowedCurrencies)[number];
