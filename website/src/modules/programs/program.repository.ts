import type { Prisma } from '@/generated/prisma/client';
import { ContributionStatus, Currency, PayoutStatus, ProgramPermission, SurveyStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import type { ProgramCreateInput, ProgramSettingsUpdateInput } from './program.schemas';

const completedPayoutStatuses = [PayoutStatus.paid, PayoutStatus.confirmed];

const publicProgramStatsSelect = {
	slug: true,
	country: { select: { isoCode: true, currency: true } },
	_count: { select: { campaigns: true, recipients: true } },
	recipients: {
		select: {
			payouts: {
				where: { status: { in: completedPayoutStatuses } },
				select: { amount: true, amountChf: true },
			},
		},
	},
} as const;

const publicProgramSelect = {
	id: true,
	name: true,
	targetFocuses: { select: { focusId: true } },
	amountOfRecipientsForStart: true,
	programDurationInMonths: true,
	payoutPerInterval: true,
	payoutInterval: true,
	country: { select: { isoCode: true, currency: true } },
	programAccesses: {
		select: {
			permission: true,
			organization: { select: { name: true } },
		},
	},
	recipients: {
		select: {
			startDate: true,
			localPartner: { select: { name: true, slug: true } },
			payouts: {
				where: { status: { in: completedPayoutStatuses } },
				select: { amount: true },
			},
			surveys: {
				where: { status: SurveyStatus.completed },
				select: { id: true },
			},
		},
	},
} as const;

export const findPublicProgramFilterDataBySlugs = async (slugs: string[]) =>
	prisma.program.findMany({
		where: { slug: { in: slugs } },
		select: {
			id: true,
			slug: true,
			country: { select: { isoCode: true } },
			targetFocuses: {
				select: {
					focus: { select: { id: true, slug: true } },
				},
			},
		},
	});

export const findPublicTargetFocusesByProgramId = async (programId: string) =>
	prisma.programTargetFocus.findMany({
		where: { programId },
		select: {
			focus: { select: { id: true, slug: true, name: true } },
		},
	});

export const findProgramWallets = async (programIds: string[]) =>
	prisma.program.findMany({
		where: { id: { in: programIds } },
		select: {
			id: true,
			name: true,
			country: { select: { isoCode: true, currency: true } },
			recipients: {
				select: {
					payouts: {
						where: { status: { in: completedPayoutStatuses } },
						select: { amount: true },
					},
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	});

export const findPublicProgramBySlug = async (slug: string) =>
	prisma.program.findUnique({ where: { slug }, select: publicProgramSelect });

export const findPublicPreviewProgramBySlug = async (slug: string) =>
	prisma.program.findUnique({
		where: { slug },
		select: { id: true, name: true },
	});

export const findPublicProgramStatsById = async (programId: string) =>
	prisma.program.findUnique({
		where: { id: programId },
		select: publicProgramStatsSelect,
	});

export const findPublicProgramStatsBySlugs = async (slugs: string[]) =>
	prisma.program.findMany({
		where: { slug: { in: slugs } },
		select: publicProgramStatsSelect,
	});

export const findProgramIdBySlug = async (slug: string) =>
	prisma.program.findUnique({ where: { slug }, select: { id: true } });

export const findProgramSlugById = async (programId: string) =>
	prisma.program.findUnique({ where: { id: programId }, select: { slug: true } });

export const findProgramNameById = async (programId: string) =>
	prisma.program.findUnique({ where: { id: programId }, select: { name: true } });

export const findProgramOptions = async () =>
	prisma.program.findMany({
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const findProgramsByIds = async (programIds: string[]) =>
	prisma.program.findMany({
		where: { id: { in: programIds } },
		select: { id: true },
	});

export const countProgramsCreatedBetween = async (from: Date, to: Date) =>
	prisma.program.count({
		where: { createdAt: { gte: from, lt: to } },
	});

export const findProgramPayoutForecastSource = async (programId: string) =>
	prisma.program.findUnique({
		where: { id: programId },
		select: {
			programDurationInMonths: true,
			payoutPerInterval: true,
			payoutInterval: true,
			country: { select: { currency: true } },
			recipients: {
				select: {
					startDate: true,
					suspendedAt: true,
					payouts: {
						where: { status: { in: completedPayoutStatuses } },
						select: { id: true },
					},
				},
			},
		},
	});

export const findProgramSettings = async (programId: string) =>
	prisma.program.findUnique({
		where: { id: programId },
		select: {
			id: true,
			name: true,
			slug: true,
			countryId: true,
			country: { select: { isoCode: true, currency: true } },
			amountOfRecipientsForStart: true,
			coveredByReserves: true,
			programDurationInMonths: true,
			payoutPerInterval: true,
			payoutInterval: true,
			targetFocuses: { select: { focusId: true } },
			targetProfiles: true,
			programAccesses: { select: { organizationId: true, permission: true } },
			createdAt: true,
			updatedAt: true,
		},
	});

export const findProgramOrganizationOptions = async (programId: string) =>
	prisma.programAccess.findMany({
		where: { programId },
		select: {
			organization: { select: { id: true, name: true } },
		},
		orderBy: { organization: { name: 'asc' } },
	});

export const findProgramDashboardSource = async (programId: string) =>
	prisma.program.findUnique({
		where: { id: programId },
		select: {
			id: true,
			name: true,
			coveredByReserves: true,
			programDurationInMonths: true,
			payoutPerInterval: true,
			country: { select: { currency: true } },
			payoutInterval: true,
			recipients: {
				select: {
					id: true,
					startDate: true,
					suspendedAt: true,
					payouts: {
						select: {
							paymentAt: true,
							amount: true,
							amountChf: true,
							status: true,
						},
					},
					surveys: { select: { id: true, status: true } },
				},
			},
			campaigns: {
				select: {
					contributions: {
						where: { status: ContributionStatus.succeeded },
						select: {
							amountChf: true,
							contributorId: true,
							paymentEvent: { select: { type: true } },
						},
					},
				},
			},
		},
	});

export const createProgram = async (input: ProgramCreateInput, name: string, slug: string) =>
	prisma.program.create({
		data: {
			name,
			slug,
			countryId: input.countryId,
			amountOfRecipientsForStart: input.amountOfRecipientsForStart,
			coveredByReserves: false,
			programDurationInMonths: input.programDurationInMonths,
			payoutPerInterval: input.payoutPerInterval,
			payoutInterval: input.payoutInterval,
			targetFocuses: {
				create: input.targetFocuses.map((focusId) => ({ focusId })),
			},
			targetProfiles: input.targetProfiles,
		},
		select: { id: true },
	});

export const createDefaultCampaign = async (programId: string, endDate: Date) =>
	prisma.campaign.create({
		data: {
			currency: Currency.CHF,
			endDate,
			isDefault: true,
			program: { connect: { id: programId } },
		},
		select: { id: true },
	});

export const findProgramByName = async (name: string) =>
	prisma.program.findUnique({ where: { name }, select: { id: true } });

export const findProgramBySlug = async (slug: string) =>
	prisma.program.findUnique({ where: { slug }, select: { id: true } });

export const updateProgramSettings = async (input: ProgramSettingsUpdateInput, slug: string) => {
	const ownerOrganizationIds = [...new Set(input.ownerOrganizationIds)];
	const operatorOrganizationIds = [...new Set(input.operatorOrganizationIds)];
	const programAccesses: Prisma.ProgramAccessCreateManyInput[] = [
		...ownerOrganizationIds.map((organizationId) => ({
			programId: input.id,
			organizationId,
			permission: ProgramPermission.owner,
		})),
		...operatorOrganizationIds.map((organizationId) => ({
			programId: input.id,
			organizationId,
			permission: ProgramPermission.operator,
		})),
	];

	await prisma.$transaction(async (transaction) => {
		await transaction.program.update({
			where: { id: input.id },
			data: {
				name: input.name,
				slug,
				countryId: input.countryId,
				coveredByReserves: input.coveredByReserves,
				programDurationInMonths: input.programDurationInMonths,
				payoutPerInterval: input.payoutPerInterval,
				payoutInterval: input.payoutInterval,
				targetFocuses: {
					deleteMany: {},
					create: input.targetFocuses.map((focusId) => ({ focusId })),
				},
				targetProfiles: input.targetProfiles,
			},
		});
		await transaction.programAccess.deleteMany({
			where: {
				programId: input.id,
				permission: { in: [ProgramPermission.owner, ProgramPermission.operator] },
			},
		});
		if (programAccesses.length > 0) {
			await transaction.programAccess.createMany({ data: programAccesses });
		}
	});
};

export const findProgramDeletionBlockers = async (programId: string) => {
	const [payout, contribution] = await Promise.all([
		prisma.payout.findFirst({
			where: { recipient: { programId } },
			select: { id: true },
		}),
		prisma.contribution.findFirst({
			where: { campaign: { programId } },
			select: { id: true },
		}),
	]);

	return { hasPayouts: Boolean(payout), hasContributions: Boolean(contribution) };
};

export const deleteProgram = async (programId: string) => {
	await prisma.$transaction(async (transaction) => {
		await transaction.recipient.updateMany({
			where: { programId },
			data: { programId: null },
		});
		await transaction.survey.updateMany({
			where: { surveySchedule: { programId } },
			data: { surveyScheduleId: null },
		});
		await transaction.campaign.deleteMany({ where: { programId } });
		await transaction.surveySchedule.deleteMany({ where: { programId } });
		await transaction.programAccess.deleteMany({ where: { programId } });
		await transaction.program.delete({ where: { id: programId } });
	});
};

export const findEligiblePublicSubmissionPrograms = async (slugs: string[]) =>
	prisma.program.findMany({
		where: {
			slug: { in: slugs },
			recipients: { some: {} },
		},
		select: {
			id: true,
			name: true,
			slug: true,
			countryId: true,
			country: { select: { isoCode: true } },
			targetFocuses: {
				select: {
					focus: { select: { name: true } },
				},
			},
			_count: { select: { recipients: true } },
		},
		orderBy: { name: 'asc' },
	});

export const findEligiblePublicSubmissionProgram = async (programId: string, slugs: string[]) =>
	prisma.program.findFirst({
		where: {
			id: programId,
			slug: { in: slugs },
			recipients: { some: {} },
		},
		select: { id: true },
	});
