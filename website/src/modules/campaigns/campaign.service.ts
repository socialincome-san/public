import { Currency, ProgramPermission } from '@/generated/prisma/enums';
import { fetchStoryblokListedCampaigns } from '@/integrations/storyblok/storyblok-campaign.integration';
import { listCampaignDefaultImages } from '@/integrations/storyblok/storyblok-management.integration';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { defaultLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import { nowMs } from '@/lib/utils/now';
import { getLatestRateForCurrency } from '@/modules/exchange-rates/exchange-rate.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { canListCampaigns } from './campaign.permissions';
import * as campaignRepository from './campaign.repository';
import {
	isCampaignActive,
	matchesPublicCampaignActivity,
	type CampaignCmsJoin,
	type CampaignCmsJoinWithStats,
	type CampaignDefaultImageOption,
	type CampaignOption,
	type CampaignPage,
	type CampaignReference,
	type CampaignTableEntry,
	type PublicCampaignActivity,
	type PublicCampaignStats,
	type PublicCampaignStatsMap,
} from './campaign.types';

export const countCampaignsCreatedBetween = async (from: Date, to: Date): Promise<ServiceResult<number>> => {
	try {
		return resultOk(await campaignRepository.countCampaignsCreatedBetween(from, to));
	} catch (error) {
		console.error('Could not count newly created campaigns', { error });

		return resultFail('Could not count newly created campaigns');
	}
};

export const getCampaignById = async (campaignId: string): Promise<ServiceResult<CampaignPage>> => {
	try {
		const campaign = await campaignRepository.findCampaignPageById(campaignId);
		if (!campaign) {
			return resultFail('Campaign not found');
		}

		return resultOk(await toCampaignPage(campaign));
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch campaign');
	}
};

export const getCampaignByPortalSlug = async (portalSlug: string): Promise<ServiceResult<CampaignPage>> => {
	try {
		const normalizedSlug = portalSlug.trim();
		if (!normalizedSlug) {
			return resultFail('Missing campaign slug');
		}

		const campaign = await campaignRepository.findCampaignPageBySlug(normalizedSlug);
		if (!campaign) {
			return resultFail('Campaign not found');
		}

		return resultOk(await toCampaignPage(campaign));
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch campaign');
	}
};

const getPublicCampaignReferenceById = async (
	campaignId: string,
): Promise<ServiceResult<{ campaignPortalSlug: string }>> => {
	try {
		const normalizedId = campaignId.trim();
		if (!normalizedId) {
			return resultFail('Missing campaign id');
		}

		const campaign = await campaignRepository.findCampaignPublicReferenceById(normalizedId);
		if (!campaign?.slug) {
			return resultFail('Campaign not found');
		}

		return resultOk({ campaignPortalSlug: campaign.slug });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch campaign reference');
	}
};

export const getCampaignsForCmsJoin = async (options?: {
	activity?: PublicCampaignActivity;
}): Promise<ServiceResult<CampaignCmsJoin[]>> => {
	const activity = options?.activity ?? 'active';

	try {
		const campaigns = await campaignRepository.findCampaignsForCmsJoin();
		const exchangeRateCache = new Map<Currency, number | null>();
		const publicCampaigns: CampaignCmsJoin[] = [];

		for (const campaign of campaigns) {
			const campaignSlug = campaign.slug?.trim();
			if (!campaignSlug) {
				continue;
			}

			const { amountCollected } = await computeCollectedAmount(
				campaign.contributions,
				campaign.additionalAmountChf,
				campaign.currency,
				campaign.goal,
				exchangeRateCache,
			);
			const isActive = isCampaignActive({
				endDate: campaign.endDate,
				goal: campaign.goal,
				amountCollected,
			});

			if (!matchesPublicCampaignActivity(isActive, activity)) {
				continue;
			}

			const goal = campaign.goal !== null && campaign.goal !== undefined ? Number(campaign.goal) : null;

			publicCampaigns.push({
				id: campaign.id,
				slug: campaignSlug,
				currency: campaign.currency,
				endDate: campaign.endDate,
				goal: Number.isFinite(goal) ? goal : null,
				isActive,
			});
		}

		return resultOk(publicCampaigns);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch campaigns for CMS join');
	}
};

export const getAllCampaignsForCmsJoinWithStats = async (options?: {
	activity?: PublicCampaignActivity;
}): Promise<ServiceResult<CampaignCmsJoinWithStats>> => {
	const campaignsResult = await getCampaignsForCmsJoin(options);
	if (!campaignsResult.success) {
		return resultFail(campaignsResult.error);
	}

	return getPublicCampaignsWithStats(campaignsResult.data);
};

export const getPublicCampaignStatsByIds = async (campaignIds: string[]): Promise<ServiceResult<PublicCampaignStatsMap>> => {
	try {
		const normalizedCampaignIds = [...new Set(campaignIds.map((campaignId) => campaignId.trim()).filter(Boolean))];
		if (!normalizedCampaignIds.length) {
			return resultOk({});
		}

		const campaigns = await campaignRepository.findCampaignsForPublicStats(normalizedCampaignIds);
		const exchangeRateCache = new Map<Currency, number | null>();
		const statsById: PublicCampaignStatsMap = {};
		for (const campaign of campaigns) {
			const { amountCollected, percentageCollected } = await computeCollectedAmount(
				campaign.contributions,
				campaign.additionalAmountChf,
				campaign.currency,
				campaign.goal,
				exchangeRateCache,
			);
			const stats: PublicCampaignStats = {
				contributionsCount: campaign.contributions.length,
				daysLeft: Math.max(0, daysUntilTs(campaign.endDate)),
				amountCollected,
				percentageCollected,
			};
			statsById[campaign.id] = stats;
		}

		return resultOk(statsById);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch campaign stats map');
	}
};

export const getPublicCampaignsWithStats = async (
	campaigns: CampaignCmsJoin[],
): Promise<ServiceResult<CampaignCmsJoinWithStats>> => {
	const campaignIds = [...new Set(campaigns.map((campaign) => campaign.id))];
	const statsResult = await getPublicCampaignStatsByIds(campaignIds);

	return resultOk({
		campaigns,
		statsById: statsResult.success ? statsResult.data : {},
	});
};

export const getEditableCampaignOptions = async (userId: string): Promise<ServiceResult<CampaignOption[]>> => {
	try {
		const accessibleProgramsResult = await getAccessiblePrograms(userId);
		if (!accessibleProgramsResult.success) {
			return resultFail(accessibleProgramsResult.error);
		}
		if (!canListCampaigns(accessibleProgramsResult.data)) {
			return resultOk([]);
		}

		const programIds = uniqueIds(
			accessibleProgramsResult.data
				.filter((access) => access.permission === ProgramPermission.operator)
				.map((access) => access.programId),
		);
		if (programIds.length === 0) {
			return resultOk([]);
		}

		const campaigns = await campaignRepository.findEditableCampaignOptions(programIds);
		const options = campaigns.flatMap((campaign) => (campaign.slug ? [{ id: campaign.id, name: campaign.slug }] : []));

		return resultOk(options);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch editable campaign options');
	}
};

export const getCampaignTableEntries = async (userId: string): Promise<ServiceResult<CampaignTableEntry[]>> => {
	try {
		const accessibleProgramsResult = await getAccessiblePrograms(userId);
		if (!accessibleProgramsResult.success) {
			return resultFail(accessibleProgramsResult.error);
		}
		if (!canListCampaigns(accessibleProgramsResult.data)) {
			return resultOk([]);
		}

		const programIds = uniqueIds(
			accessibleProgramsResult.data
				.filter((access) => access.permission === ProgramPermission.operator)
				.map((access) => access.programId),
		);
		if (programIds.length === 0) {
			return resultOk([]);
		}

		const campaigns = await campaignRepository.findCampaignTableEntries(programIds);
		const exchangeRateCache = new Map<Currency, number | null>();
		const entries: CampaignTableEntry[] = [];
		for (const campaign of campaigns) {
			const slug = campaign.slug?.trim();
			if (!slug) {
				continue;
			}
			const { amountCollected } = await computeCollectedAmount(
				campaign.contributions,
				campaign.additionalAmountChf,
				campaign.currency,
				campaign.goal,
				exchangeRateCache,
			);

			entries.push({
				id: campaign.id,
				slug,
				currency: campaign.currency,
				endDate: campaign.endDate,
				isActive: isCampaignActive({
					endDate: campaign.endDate,
					goal: campaign.goal,
					amountCollected,
				}),
				programName: campaign.program?.name ?? null,
				programPortalSlug: campaign.program?.slug ?? null,
				createdAt: campaign.createdAt,
			});
		}

		return resultOk(entries);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch campaigns');
	}
};

export const getFallbackCampaign = async (): Promise<ServiceResult<CampaignReference>> => {
	try {
		const campaign = await campaignRepository.findFallbackCampaign();
		if (!campaign) {
			return resultFail('No fallback campaign found');
		}

		return resultOk(campaign);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch default campaign');
	}
};

export const getDefaultCampaignForProgram = async (programId: string): Promise<ServiceResult<CampaignReference>> => {
	try {
		const campaign = await campaignRepository.findDefaultCampaignForProgram(programId);
		if (!campaign) {
			return resultFail('No default campaign found for program');
		}

		return resultOk(campaign);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch campaign for program');
	}
};

const DEFAULT_IMAGE_THUMB_WIDTH = 160;
const DEFAULT_IMAGE_THUMB_HEIGHT = 160;

export const getCampaignDefaultImages = async (): Promise<ServiceResult<CampaignDefaultImageOption[]>> => {
	const assetsResult = await listCampaignDefaultImages(campaignSubmissionConfig.maxCampaignDefaultImages);
	if (!assetsResult.success) {
		return resultFail('Could not load campaign default images.', assetsResult.status);
	}

	return resultOk(
		assetsResult.data.map((asset) => ({
			id: asset.id,
			url: formatStoryblokUrl(asset.filename, DEFAULT_IMAGE_THUMB_WIDTH, DEFAULT_IMAGE_THUMB_HEIGHT, asset.focus),
			alt: asset.alt,
		})),
	);
};

export const getPublicCampaignTitle = async (campaignId: string): Promise<ServiceResult<{ title: string }>> => {
	const campaignReference = await getPublicCampaignReferenceById(campaignId);
	if (!campaignReference.success) {
		return campaignReference;
	}

	const campaignStories = await fetchStoryblokListedCampaigns(defaultLanguage);
	if (!campaignStories.success) {
		return resultFail(campaignStories.error);
	}

	const story = campaignStories.data.find(
		(candidate) => getCampaignPortalSlug(candidate.content) === campaignReference.data.campaignPortalSlug,
	);
	if (!story) {
		return resultFail('Campaign not found');
	}

	return resultOk({ title: getCampaignTitle(story.content) });
};

const getCampaignPortalSlug = (campaign: { portalSlug?: string | null }) => campaign.portalSlug?.trim() ?? '';

const getCampaignTitle = (campaign: { title: string; portalSlug?: string | null }) =>
	campaign.title.trim() || getCampaignPortalSlug(campaign);

const toCampaignPage = async (campaign: {
	id: string;
	goal: unknown;
	currency: Currency;
	additionalAmountChf: unknown;
	endDate: Date;
	slug: string | null;
	program: { id: string; name: string } | null;
	createdAt: Date;
	contributions: { amountChf: unknown }[];
}): Promise<CampaignPage> => {
	const { amountCollected, percentageCollected } = await computeCollectedAmount(
		campaign.contributions,
		campaign.additionalAmountChf,
		campaign.currency,
		campaign.goal,
		new Map(),
	);

	return {
		...campaign,
		goal: campaign.goal ? Number(campaign.goal) : null,
		additionalAmountChf: campaign.additionalAmountChf ? Number(campaign.additionalAmountChf) : null,
		numberOfContributions: campaign.contributions.length,
		percentageCollected,
		daysLeft: daysUntilTs(campaign.endDate),
		amountCollected,
	};
};

const daysUntilTs = (ts: Date): number => Math.ceil((ts.getTime() - nowMs()) / (24 * 60 * 60 * 1000));

const isValidExchangeRate = (rate: number): boolean => Number.isFinite(rate) && rate > 0;

const getExchangeRate = async (currency: Currency, cache: Map<Currency, number | null>): Promise<number | null> => {
	if (currency === Currency.CHF) {
		return 1;
	}

	const cachedRate = cache.get(currency);
	if (cachedRate !== undefined) {
		return cachedRate;
	}

	const exchangeRateResult = await getLatestRateForCurrency(currency);
	const rate =
		exchangeRateResult.success && isValidExchangeRate(exchangeRateResult.data.rate) ? exchangeRateResult.data.rate : null;
	cache.set(currency, rate);

	return rate;
};

const computeCollectedAmount = async (
	contributions: { amountChf: unknown }[],
	additionalAmountChf: unknown,
	currency: Currency,
	goal: unknown,
	cache: Map<Currency, number | null>,
): Promise<{ amountCollected: number | null; percentageCollected: number | null }> => {
	const exchangeRate = await getExchangeRate(currency, cache);
	if (exchangeRate === null) {
		return { amountCollected: null, percentageCollected: null };
	}

	let amountCollected = contributions.reduce((sum, contribution) => sum + Number(contribution.amountChf), 0);
	amountCollected += Number(additionalAmountChf) || 0;
	amountCollected *= exchangeRate;

	const goalAmount = goal ? Number(goal) : null;
	const percentageCollected = goalAmount ? Math.round((amountCollected / goalAmount) * 100) : null;

	return { amountCollected, percentageCollected };
};

const uniqueIds = (ids: string[]): string[] => Array.from(new Set(ids));
