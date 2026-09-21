import { ContributionStatus, Currency, PaymentEventType, ProgramPermission } from '@/generated/prisma/enums';
import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';
import { START_CHARACTER_REGEX, UNDERSCORE_REGEX } from '@/lib/utils/regex';
import { findContributorById, getEditableContributorOptions } from '@/modules/contributors/contributor.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import type { ISbStoryData } from '@storyblok/js';
import { endOfYear, startOfYear } from 'date-fns';
import { canListContributions, canReadContribution, canWriteContribution } from './contribution.permissions';
import * as contributionRepository from './contribution.repository';
import {
	contributionCreateSchema,
	contributionUpdateSchema,
	type CreateContributionInput,
	type UpdateContributionInput,
} from './contribution.schemas';
import type {
	BankTransferUpsertInput,
	ContributionDonationEntry,
	ContributionFormOptions,
	ContributionPaginatedTableView,
	ContributionPayload,
	ContributionRecord,
	ContributionTableQuery,
	ContributionTableViewRow,
	ContributorContributionSummary,
	GlobeContribution,
	PaymentEventCreateData,
	PaymentEventRecord,
	StripeContributionCreateData,
	YourContributionsPaginatedTableView,
	YourContributionsTableQuery,
	YourContributionsTableViewRow,
} from './contribution.types';

const PAYMENT_EVENT_TYPES = [
	PaymentEventType.stripe,
	PaymentEventType.bank_transfer,
	PaymentEventType.benevity,
	PaymentEventType.cash,
	PaymentEventType.raisenow,
] as const;

export const getContribution = async (
	userId: string,
	contributionId: string,
): Promise<ServiceResult<ContributionPayload>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const contribution = await contributionRepository.findContribution(contributionId);
		if (!contribution) {
			return resultFail('Contribution not found');
		}
		if (!canReadContribution(accessResult.data, contribution.campaign.programId)) {
			return resultFail('Permission denied');
		}

		return resultOk(toContributionPayload(contribution));
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contribution');
	}
};

export const getPaginatedTableView = async (
	userId: string,
	query: ContributionTableQuery,
): Promise<ServiceResult<ContributionPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canListContributions(accessResult.data)) {
			return resultOk({
				tableRows: [],
				totalCount: 0,
				filterOptions: { programs: [], campaigns: [], paymentEventTypes: [] },
			});
		}

		const accessibleProgramIds = uniqueProgramIds(
			accessResult.data
				.filter((program) => program.permission === ProgramPermission.operator)
				.map((program) => program.programId),
		);
		if (accessibleProgramIds.length === 0) {
			return resultOk({
				tableRows: [],
				totalCount: 0,
				filterOptions: { programs: [], campaigns: [], paymentEventTypes: [] },
			});
		}

		const search = query.search.trim();
		const selectedProgramId = emptyToUndefined(query.programId);
		const selectedCampaignId = emptyToUndefined(query.campaignId);
		const selectedPaymentEventType = parsePaymentEventType(emptyToUndefined(query.paymentEventType));
		const campaignStories = await getCampaignStories();
		const campaigns = await contributionRepository.findCampaignsByProgramIds(accessibleProgramIds);
		const campaignIds = campaigns.map((campaign) => campaign.id);
		const filterOptions = {
			programs: Array.from(
				new Map(
					campaigns
						.filter((campaign) => campaign.program.id && campaign.program.name)
						.map((campaign) => [campaign.program.id, { value: campaign.program.id, label: campaign.program.name }]),
				).values(),
			),
			campaigns: campaigns.flatMap((campaign) =>
				campaign.slug
					? [{ value: campaign.id, label: getStoryblokCampaignTitleForSlug(campaignStories, campaign.slug) }]
					: [],
			),
			paymentEventTypes: PAYMENT_EVENT_TYPES.map((type) => ({
				value: type,
				label:
					type === PaymentEventType.bank_transfer
						? 'Wire transfer'
						: type.replace(UNDERSCORE_REGEX, ' ').replace(START_CHARACTER_REGEX, (character) => character.toUpperCase()),
			})),
		};
		const filteredCampaignIds = selectedCampaignId
			? campaignIds.filter((id) => id === selectedCampaignId)
			: selectedProgramId
				? campaigns.filter((campaign) => campaign.program.id === selectedProgramId).map((campaign) => campaign.id)
				: campaignIds;
		if (filteredCampaignIds.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0, filterOptions });
		}

		const campaignIdsMatchingTitle = search
			? campaigns
					.filter(
						(campaign) =>
							campaign.slug &&
							getStoryblokCampaignTitleForSlug(campaignStories, campaign.slug)
								.toLocaleLowerCase()
								.includes(search.toLocaleLowerCase()),
					)
					.map((campaign) => campaign.id)
			: [];
		const sortByCampaignTitle = query.sortBy === 'campaignTitle';
		const { contributions, totalCount } = await contributionRepository.findContributionTableSource({
			campaignIds: filteredCampaignIds,
			paymentEventType: selectedPaymentEventType,
			search,
			campaignIdsMatchingTitle,
			query,
			paginate: !sortByCampaignTitle,
		});
		const tableRows: ContributionTableViewRow[] = contributions.map((contribution) => ({
			id: contribution.id,
			firstName: contribution.contributor.contact?.firstName ?? '',
			lastName: contribution.contributor.contact?.lastName ?? '',
			email: contribution.contributor.contact?.email ?? '',
			amount: contribution.amount ? Number(contribution.amount) : 0,
			currency: contribution.currency,
			campaignId: contribution.campaign.id,
			campaignTitle: contribution.campaign.slug
				? getStoryblokCampaignTitleForSlug(campaignStories, contribution.campaign.slug)
				: '',
			paymentEventType: contribution.paymentEvent?.type ?? null,
			programName: contribution.campaign.program?.name ?? null,
			createdAt: contribution.createdAt,
		}));
		if (sortByCampaignTitle) {
			const direction = query.sortDirection === 'asc' ? 1 : -1;
			tableRows.sort((left, right) => direction * left.campaignTitle.localeCompare(right.campaignTitle));
		}
		const paginatedRows = sortByCampaignTitle
			? tableRows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
			: tableRows;

		return resultOk({ tableRows: paginatedRows, totalCount, filterOptions });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contributions');
	}
};

export const getSucceededForContributorAndYear = async (
	contributorId: string,
	year: number,
): Promise<ServiceResult<ContributionDonationEntry[]>> => {
	try {
		const start = startOfYear(new Date(year, 0, 1));
		const end = endOfYear(new Date(year, 0, 1));
		const result = await contributionRepository.findSucceededContributionsForContributorAndYear(contributorId, start, end);

		return resultOk(
			result.map((contribution) => ({
				contributorId: contribution.contributorId,
				amount: Number(contribution.amount),
				currency: contribution.currency,
				amountChf: Number(contribution.amountChf),
				feesChf: Number(contribution.feesChf),
				status: contribution.status,
				createdAt: contribution.createdAt,
			})),
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contributions for contributor');
	}
};

export const getContributorContributionSummary = async (
	contributorId: string,
): Promise<ServiceResult<ContributorContributionSummary>> => {
	try {
		const summary = await contributionRepository.findContributorContributionSummary(contributorId);

		return resultOk({
			totalAmountChf: Number(summary.totalAmountChf ?? 0),
			count: summary.count,
			firstContributionAt: summary.firstContributionAt,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contribution summary for contributor');
	}
};

export const getPaginatedYourContributionsTableView = async (
	contributorId: string,
	query: YourContributionsTableQuery,
): Promise<ServiceResult<YourContributionsPaginatedTableView>> => {
	try {
		const search = query.search.trim();
		const matchedCurrency = parseCurrency(search);
		const campaignStories = await getCampaignStories();
		const campaignSlugsMatchingTitle = search
			? campaignStories
					.filter((story) => getCampaignTitle(story.content).toLocaleLowerCase().includes(search.toLocaleLowerCase()))
					.map((story) => getCampaignPortalSlug(story.content))
					.filter((slug) => slug.length > 0)
			: [];
		const sortByCampaignTitle = query.sortBy === 'campaignTitle';
		const { contributions, totalCount } = await contributionRepository.findYourContributionTableSource({
			contributorId,
			search,
			matchedCurrency,
			campaignSlugsMatchingTitle,
			query,
			paginate: !sortByCampaignTitle,
		});
		const tableRows: YourContributionsTableViewRow[] = contributions.map((contribution) => ({
			createdAt: contribution.createdAt,
			updatedAt: contribution.updatedAt,
			amount: contribution.amount ? Number(contribution.amount) : 0,
			currency: contribution.currency,
			campaignTitle: contribution.campaign.slug
				? getStoryblokCampaignTitleForSlug(campaignStories, contribution.campaign.slug)
				: '',
			paymentEventType: contribution.paymentEvent?.type ?? null,
			status: contribution.status,
		}));
		if (sortByCampaignTitle) {
			const direction = query.sortDirection === 'asc' ? 1 : -1;
			tableRows.sort((left, right) => direction * left.campaignTitle.localeCompare(right.campaignTitle));
		}
		const paginatedRows = sortByCampaignTitle
			? tableRows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
			: tableRows;

		return resultOk({ tableRows: paginatedRows, totalCount });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contributions for contributor');
	}
};

export const getRecentSuccessfulContributions = async (cutoff: Date): Promise<ServiceResult<GlobeContribution[]>> => {
	try {
		const rows = await contributionRepository.findRecentSuccessfulContributions(cutoff);
		let skipped = 0;
		const contributions: GlobeContribution[] = [];

		for (const row of rows) {
			const countryCode = row.contributor.contact?.address?.country ?? null;
			if (!countryCode || !isValidCountryCode(countryCode)) {
				skipped++;
				continue;
			}
			contributions.push({
				key: `contribution-${contributions.length}`,
				amount: Number(row.amount),
				currency: row.currency,
				contributedAt: row.createdAt.toISOString(),
				countryCode,
				countryName: getCountryNameByCode(countryCode),
			});
		}

		if (skipped > 0) {
			console.warn(`Skipped ${skipped} contributions without a country for globe visualization.`);
		}

		return resultOk(contributions);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recent contributions for globe');
	}
};

export const getContributionFormOptions = async (userId: string): Promise<ServiceResult<ContributionFormOptions>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const contributorOptionsResult = await getEditableContributorOptions(userId);
		if (!contributorOptionsResult.success) {
			return resultFail(contributorOptionsResult.error);
		}

		const accessibleProgramIds = uniqueProgramIds(
			accessResult.data
				.filter((program) => program.permission === ProgramPermission.operator)
				.map((program) => program.programId),
		);
		if (accessibleProgramIds.length === 0) {
			return resultOk({ contributorOptions: contributorOptionsResult.data, campaignOptions: [] });
		}

		const [campaigns, campaignStories] = await Promise.all([
			contributionRepository.findCampaignsByProgramIds(accessibleProgramIds),
			getCampaignStories(),
		]);

		return resultOk({
			contributorOptions: contributorOptionsResult.data,
			campaignOptions: campaigns.flatMap((campaign) =>
				campaign.slug ? [{ id: campaign.id, name: getStoryblokCampaignTitleForSlug(campaignStories, campaign.slug) }] : [],
			),
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contribution form options');
	}
};

export const updateContribution = async (
	userId: string,
	input: UpdateContributionInput,
): Promise<ServiceResult<ContributionPayload>> => {
	const validatedInputResult = validateUpdateInput(input);
	if (!validatedInputResult.success) {
		return resultFail(validatedInputResult.error);
	}
	const validatedInput = validatedInputResult.data;

	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const existing = await contributionRepository.findContributionForUpdate(validatedInput.id);
		if (!existing) {
			return resultFail('Contribution not found');
		}
		if (!canWriteContribution(accessResult.data, existing.campaign.programId)) {
			return resultFail('No permissions to update contribution');
		}

		const referencesResult = await validateReferencesExist({
			contributorId: validatedInput.contributorId,
			campaignId: validatedInput.campaignId,
		});
		if (!referencesResult.success) {
			return resultFail(referencesResult.error);
		}

		const campaign = await contributionRepository.findCampaignById(validatedInput.campaignId);
		if (!campaign) {
			return resultFail('Campaign not found');
		}
		if (!canWriteContribution(accessResult.data, campaign.programId)) {
			return resultFail('Permission denied');
		}

		const updatedContribution = await contributionRepository.updateContribution(validatedInput.id, validatedInput);

		return resultOk(toContributionPayload(updatedContribution));
	} catch (error) {
		console.error(error);

		return resultFail('Could not update contribution. Please try again later.');
	}
};

export const createContribution = async (
	userId: string,
	input: CreateContributionInput,
): Promise<ServiceResult<ContributionPayload>> => {
	const validatedInputResult = validateCreateInput(input);
	if (!validatedInputResult.success) {
		return resultFail(validatedInputResult.error);
	}
	const validatedInput = validatedInputResult.data;

	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const referencesResult = await validateReferencesExist({
			contributorId: validatedInput.contributorId,
			campaignId: validatedInput.campaignId,
		});
		if (!referencesResult.success) {
			return resultFail(referencesResult.error);
		}

		const campaign = await contributionRepository.findCampaignById(validatedInput.campaignId);
		if (!campaign) {
			return resultFail('Campaign not found');
		}
		if (!canWriteContribution(accessResult.data, campaign.programId)) {
			return resultFail('Permission denied');
		}

		const created = await contributionRepository.createContribution(validatedInput);

		return resultOk(toContributionPayload(created));
	} catch (error) {
		console.error(error);

		return resultFail('Could not create contribution. Please try again later.');
	}
};

export const upsertFromStripeEvent = async (
	contributionData: StripeContributionCreateData,
	paymentEventData: PaymentEventCreateData,
): Promise<ServiceResult<ContributionRecord>> => {
	try {
		const paymentEvent = await contributionRepository.updatePaymentEventFromStripe(contributionData, paymentEventData);
		if (!paymentEvent.contribution) {
			return resultFail('Could not create or update contribution from Stripe event');
		}

		return resultOk(toContributionRecord(paymentEvent.contribution));
	} catch (error) {
		console.error(error);

		return resultFail('Could not create or update contribution from Stripe event');
	}
};

export const upsertFromBankTransfer = async (
	paymentEvent: BankTransferUpsertInput,
): Promise<ServiceResult<PaymentEventRecord>> => {
	try {
		const existing = await contributionRepository.findPaymentEventByTransactionId(paymentEvent.transactionId);
		if (existing?.contribution?.status === ContributionStatus.pending) {
			return resultOk(await contributionRepository.updatePaymentEventFromBankTransfer(existing.id, paymentEvent));
		}
		if (existing) {
			return resultOk(await contributionRepository.createPaymentEventFromBankTransfer(paymentEvent, true));
		}

		return resultOk(await contributionRepository.createPaymentEventFromBankTransfer(paymentEvent, false));
	} catch (error) {
		console.error(error);

		return resultFail('Could not create payment events with contributions');
	}
};

const validateCreateInput = (input: CreateContributionInput): ServiceResult<CreateContributionInput> => {
	const parsedInput = contributionCreateSchema.safeParse(input);

	return parsedInput.success
		? resultOk(parsedInput.data)
		: resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
};

const validateUpdateInput = (input: UpdateContributionInput): ServiceResult<UpdateContributionInput> => {
	const parsedInput = contributionUpdateSchema.safeParse(input);

	return parsedInput.success
		? resultOk(parsedInput.data)
		: resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
};

const validateReferencesExist = async (input: {
	contributorId: string;
	campaignId: string;
}): Promise<ServiceResult<void>> => {
	const [contributorResult, campaign] = await Promise.all([
		findContributorById(input.contributorId),
		contributionRepository.findCampaignById(input.campaignId),
	]);
	if (!contributorResult.success) {
		return resultFail(contributorResult.error);
	}
	if (!contributorResult.data) {
		return resultFail('Contributor not found.');
	}
	if (!campaign) {
		return resultFail('Campaign not found.');
	}

	return resultOk(undefined);
};

const getCampaignStories = async (): Promise<ISbStoryData<Campaign>[]> => {
	const { services } = await import('@/lib/services/services');
	const result = await services.storyblok.getCampaigns(defaultLanguage);

	return result.success ? result.data : [];
};

const getCampaignPortalSlug = (campaign: Campaign): string => campaign.portalSlug?.trim() ?? '';

const getCampaignTitle = (campaign: Campaign): string => campaign.title.trim() || getCampaignPortalSlug(campaign);

const getStoryblokCampaignTitleForSlug = (campaigns: ISbStoryData<Campaign>[], slug: string): string => {
	const campaign = campaigns.find((story) => getCampaignPortalSlug(story.content) === slug);

	return campaign ? getCampaignTitle(campaign.content) : slug;
};

const toContributionPayload = (contribution: {
	id: string;
	amount: unknown;
	currency: Currency;
	amountChf: unknown;
	feesChf: unknown;
	status: ContributionStatus;
	contributor: { id: string };
	campaign: { id: string };
}): ContributionPayload => ({
	id: contribution.id,
	amount: Number(contribution.amount),
	currency: contribution.currency,
	amountChf: Number(contribution.amountChf),
	feesChf: Number(contribution.feesChf),
	status: contribution.status,
	contributor: contribution.contributor,
	campaign: { id: contribution.campaign.id },
});

const toContributionRecord = (contribution: {
	id: string;
	amount: unknown;
	currency: Currency;
	amountChf: unknown;
	feesChf: unknown;
	status: ContributionStatus;
	contributorId: string;
	campaignId: string;
	createdAt: Date;
	updatedAt: Date | null;
}): ContributionRecord => ({
	id: contribution.id,
	amount: Number(contribution.amount),
	currency: contribution.currency,
	amountChf: Number(contribution.amountChf),
	feesChf: Number(contribution.feesChf),
	status: contribution.status,
	contributorId: contribution.contributorId,
	campaignId: contribution.campaignId,
	createdAt: contribution.createdAt,
	updatedAt: contribution.updatedAt,
});

const parsePaymentEventType = (value: string | undefined): PaymentEventType | undefined =>
	PAYMENT_EVENT_TYPES.find((type) => type === value);

const parseCurrency = (value: string): Currency | undefined =>
	Object.values(Currency).find((currency) => currency.toLowerCase() === value.toLowerCase());

const emptyToUndefined = (value: string | undefined): string | undefined => {
	const trimmed = value?.trim();
	if (!trimmed) {
		return undefined;
	}

	return trimmed;
};

const uniqueProgramIds = (programIds: string[]): string[] => Array.from(new Set(programIds));
