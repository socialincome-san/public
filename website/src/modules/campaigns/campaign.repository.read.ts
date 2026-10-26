import { ContributionStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';

const campaignPageSelect = {
	id: true,
	goal: true,
	currency: true,
	additionalAmountChf: true,
	endDate: true,
	slug: true,
	program: { select: { id: true, name: true } },
	createdAt: true,
	updatedAt: true,
	contributions: {
		where: { status: ContributionStatus.succeeded },
		select: { id: true, amount: true, amountChf: true },
	},
} as const;

const campaignCmsJoinSelect = {
	id: true,
	slug: true,
	currency: true,
	endDate: true,
	goal: true,
	additionalAmountChf: true,
	contributions: {
		where: { status: ContributionStatus.succeeded },
		select: { amountChf: true },
	},
} as const;

const campaignStatsSelect = {
	id: true,
	endDate: true,
	goal: true,
	currency: true,
	additionalAmountChf: true,
	contributions: {
		where: { status: ContributionStatus.succeeded },
		select: { amountChf: true },
	},
} as const;

const campaignTableSelect = {
	id: true,
	slug: true,
	currency: true,
	endDate: true,
	goal: true,
	additionalAmountChf: true,
	program: { select: { name: true, slug: true } },
	createdAt: true,
	contributions: {
		where: { status: ContributionStatus.succeeded },
		select: { amountChf: true },
	},
} as const;

const campaignReferenceSelect = {
	id: true,
	slug: true,
	endDate: true,
	programId: true,
} as const;

export const countCampaignsCreatedBetween = async (from: Date, to: Date) =>
	prisma.campaign.count({
		where: { createdAt: { gte: from, lt: to } },
	});

export const findCampaignPageById = async (campaignId: string) =>
	prisma.campaign.findFirst({
		where: { OR: [{ legacyFirestoreId: campaignId }, { id: campaignId }] },
		select: campaignPageSelect,
	});

export const findCampaignPageBySlug = async (slug: string) =>
	prisma.campaign.findFirst({
		where: { slug },
		select: campaignPageSelect,
	});

export const findCampaignPublicReferenceById = async (campaignId: string) =>
	prisma.campaign.findFirst({
		where: {
			AND: [{ OR: [{ id: campaignId }, { legacyFirestoreId: campaignId }] }, { slug: { not: null } }],
		},
		select: { slug: true },
	});

export const findCampaignsForCmsJoin = async () =>
	prisma.campaign.findMany({
		where: { slug: { not: null } },
		select: campaignCmsJoinSelect,
		orderBy: [{ createdAt: 'desc' }],
	});

export const findCampaignsForPublicStats = async (campaignIds: string[]) =>
	prisma.campaign.findMany({
		where: { id: { in: campaignIds } },
		select: campaignStatsSelect,
	});

export const findCampaignFilterOption = async (campaignId: string, programIds: string[]) =>
	prisma.campaign.findFirst({
		where: { id: campaignId, programId: { in: programIds } },
		select: { id: true, slug: true },
	});

export const findCampaignTableEntries = async (programIds: string[]) =>
	prisma.campaign.findMany({
		where: { programId: { in: programIds } },
		select: campaignTableSelect,
	});

export const findFallbackCampaign = async () =>
	prisma.campaign.findFirst({
		where: { isFallback: true },
		select: campaignReferenceSelect,
	});

export const findCampaignIdsByProgram = async (programId: string) =>
	prisma.campaign.findMany({ where: { programId }, select: { id: true } });

export const findDefaultCampaignForProgram = async (programId: string) =>
	prisma.campaign.findFirst({
		where: { programId, isDefault: true },
		select: campaignReferenceSelect,
	});

export const findCampaignIdBySlug = async (slug: string) =>
	prisma.campaign.findFirst({
		where: { slug },
		select: { id: true },
	});

export const findCampaignPendingByClaimId = async (claimId: string) =>
	prisma.campaignPending.findUnique({
		where: { claimId },
		select: {
			claimId: true,
			campaignId: true,
			campaign: {
				select: {
					id: true,
					contributorId: true,
					slug: true,
				},
			},
		},
	});
