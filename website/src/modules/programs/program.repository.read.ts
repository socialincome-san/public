import type { Prisma } from '@/generated/prisma/client';
import { ContributionStatus, PayoutStatus, SurveyStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { ProgramTableQuery } from './program.types';

const completedPayoutStatuses = [PayoutStatus.paid, PayoutStatus.confirmed];

const publicProgramStatsSelect = {
	slug: true,
	isConcluded: true,
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

export const findPaginatedPrograms = async (query: ProgramTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.ProgramWhereInput = {
		...(query.organizationId
			? {
					programAccesses: {
						some: {
							organizationId: query.organizationId,
							...(query.programPermission ? { permission: query.programPermission } : {}),
						},
					},
				}
			: {}),
		...(query.countryId ? { countryId: query.countryId } : {}),
		...(query.focusId ? { targetFocuses: { some: { focusId: query.focusId } } } : {}),
		...(search
			? {
					OR: [
						{ id: { contains: search, mode: 'insensitive' } },
						{ name: { contains: search, mode: 'insensitive' } },
						{ programAccesses: { some: { organization: { name: { contains: search, mode: 'insensitive' } } } } },
						{ targetFocuses: { some: { focus: { name: { contains: search, mode: 'insensitive' } } } } },
					],
				}
			: {}),
	};

	const [programs, totalCount] = await Promise.all([
		prisma.program.findMany({
			where,
			select: {
				id: true,
				name: true,
				country: { select: { isoCode: true } },
				programAccesses: {
					select: { permission: true, organization: { select: { name: true } } },
					orderBy: { organization: { name: 'asc' } },
				},
				targetFocuses: {
					select: { focus: { select: { name: true } } },
					orderBy: { focus: { name: 'asc' } },
				},
				_count: { select: { recipients: true } },
				createdAt: true,
			},
			orderBy: buildProgramTableOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.program.count({ where }),
	]);

	return { programs, totalCount };
};

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
					interruptedAt: true,
					payouts: {
						where: { status: { in: completedPayoutStatuses } },
						select: { id: true },
					},
				},
			},
		},
	});

export const findProgramRecipientPoolContext = async (programId: string) =>
	prisma.program.findUnique({
		where: { id: programId },
		select: {
			id: true,
			programDurationInMonths: true,
			payoutPerInterval: true,
			payoutInterval: true,
			country: { select: { isoCode: true, currency: true } },
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
			isConcluded: true,
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
					interruptedAt: true,
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

export const findProgramByName = async (name: string) =>
	prisma.program.findUnique({ where: { name }, select: { id: true } });

export const findProgramBySlug = async (slug: string) =>
	prisma.program.findUnique({ where: { slug }, select: { id: true } });

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

const buildProgramTableOrderBy = (query: ProgramTableQuery): Prisma.ProgramOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'name', 'country', 'recipientsCount', 'createdAt'] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'name':
			return [{ name: direction }];
		case 'country':
			return [{ country: { isoCode: direction } }];
		case 'recipientsCount':
			return [{ recipients: { _count: direction } }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ name: 'asc' }];
	}
};
