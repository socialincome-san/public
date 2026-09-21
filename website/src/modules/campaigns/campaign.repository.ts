import { ContributionStatus, Currency } from '@/generated/prisma/enums';
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

export const findEditableCampaignOptions = async (programIds: string[]) =>
	prisma.campaign.findMany({
		where: { programId: { in: programIds }, slug: { not: null } },
		select: { id: true, slug: true },
		orderBy: { slug: 'asc' },
	});

export const findCampaignTableEntries = async (programIds: string[]) =>
	prisma.campaign.findMany({
		where: { programId: { in: programIds }, slug: { not: null } },
		select: campaignTableSelect,
	});

export const findFallbackCampaign = async () =>
	prisma.campaign.findFirst({
		where: { isFallback: true },
		select: campaignReferenceSelect,
	});

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

export const createCampaign = async (data: {
	goal: number | null;
	currency: Currency;
	endDate: Date;
	slug: string;
	programId: string;
	contributorId?: string | null;
}): Promise<{ kind: 'created'; id: string; slug: string } | { kind: 'slug-exists' }> => {
	try {
		const campaign = await prisma.campaign.create({
			data: {
				goal: data.goal,
				currency: data.currency,
				endDate: data.endDate,
				slug: data.slug,
				program: { connect: { id: data.programId } },
				...(data.contributorId ? { contributor: { connect: { id: data.contributorId } } } : {}),
			},
			select: { id: true, slug: true },
		});

		return { kind: 'created', id: campaign.id, slug: campaign.slug ?? data.slug };
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { kind: 'slug-exists' };
		}

		throw error;
	}
};

export const createCampaignPending = async (
	campaignId: string,
	claimId: string,
): Promise<{ kind: 'created' } | { kind: 'claim-id-exists' }> => {
	try {
		await prisma.campaignPending.create({
			data: { claimId, campaignId },
		});

		return { kind: 'created' };
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { kind: 'claim-id-exists' };
		}

		throw error;
	}
};

export const deleteCampaign = async (campaignId: string) => {
	await prisma.campaign.delete({ where: { id: campaignId } });
};

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

export const updateCampaignContributorForClaim = async (campaignId: string, claimId: string, contributorId: string) => {
	await prisma.$transaction([
		prisma.campaign.update({
			where: { id: campaignId },
			data: { contributor: { connect: { id: contributorId } } },
		}),
		prisma.campaignPending.delete({ where: { claimId } }),
	]);
};

export const deleteCampaignPending = async (claimId: string) => {
	await prisma.campaignPending.delete({ where: { claimId } });
};

const isUniqueConstraintError = (error: unknown): boolean => {
	if (typeof error !== 'object' || error === null || !('code' in error)) {
		return false;
	}

	return error.code === 'P2002';
};
