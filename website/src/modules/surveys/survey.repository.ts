import { Prisma, SurveyStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type {
	SurveyCreateData,
	SurveyImpactQuery,
	SurveyResponseUpdateInput,
	SurveyTableQuery,
	SurveyUpdateData,
} from './survey.types';

export const findSurveyTableSource = async ({
	programIds,
	query,
	upcomingRange,
}: {
	programIds: string[];
	query: SurveyTableQuery;
	upcomingRange?: { from: Date; to: Date };
}) => {
	const selectedProgramId = normalizeOptionalFilter(query.programId);
	const filteredProgramIds = selectedProgramId
		? programIds.filter((programId) => programId === selectedProgramId)
		: programIds;
	const search = query.search.trim();
	const baseWhere: Prisma.SurveyWhereInput = {
		recipient: { programId: { in: filteredProgramIds } },
		...(upcomingRange
			? {
					status: { not: SurveyStatus.completed },
					dueAt: { gte: upcomingRange.from, lte: upcomingRange.to },
				}
			: {}),
	};
	const where: Prisma.SurveyWhereInput = search
		? {
				AND: [
					baseWhere,
					{
						OR: [
							{ id: { contains: search, mode: 'insensitive' } },
							{ name: { contains: search, mode: 'insensitive' } },
							{ recipient: { contact: { firstName: { contains: search, mode: 'insensitive' } } } },
							{ recipient: { contact: { lastName: { contains: search, mode: 'insensitive' } } } },
							{ recipient: { program: { name: { contains: search, mode: 'insensitive' } } } },
						],
					},
				],
			}
		: baseWhere;

	const [surveys, totalCount] = await Promise.all([
		prisma.survey.findMany({
			where,
			select: {
				id: true,
				name: true,
				questionnaire: true,
				status: true,
				language: true,
				dueAt: true,
				completedAt: true,
				createdAt: true,
				accessEmail: true,
				accessPw: true,
				recipient: {
					select: {
						id: true,
						contact: { select: { firstName: true, lastName: true } },
						program: { select: { id: true, name: true } },
					},
				},
			},
			orderBy: buildSurveyOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.survey.count({ where }),
	]);

	return { surveys, totalCount };
};

export const findSurveyById = async (surveyId: string) =>
	prisma.survey.findUnique({
		where: { id: surveyId },
		select: {
			id: true,
			name: true,
			questionnaire: true,
			language: true,
			dueAt: true,
			completedAt: true,
			status: true,
			data: true,
			accessEmail: true,
			accessPw: true,
			recipientId: true,
			surveyScheduleId: true,
			createdAt: true,
			updatedAt: true,
			recipient: {
				select: {
					program: { select: { id: true } },
				},
			},
		},
	});

export const findSurveyByRecipientId = async (recipientId: string) =>
	prisma.survey.findMany({
		where: { recipientId },
		select: {
			id: true,
			name: true,
			questionnaire: true,
			language: true,
			dueAt: true,
			completedAt: true,
			status: true,
			data: true,
			accessEmail: true,
			accessPw: true,
			recipientId: true,
			surveyScheduleId: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: [{ dueAt: 'desc' }, { createdAt: 'desc' }],
	});

export const findSurveyByAccessEmail = async (accessEmail: string) =>
	prisma.survey.findUnique({
		where: { accessEmail },
		select: {
			id: true,
			name: true,
			questionnaire: true,
			language: true,
			dueAt: true,
			completedAt: true,
			status: true,
			data: true,
			accessEmail: true,
			accessPw: true,
			recipientId: true,
			surveyScheduleId: true,
			createdAt: true,
			updatedAt: true,
		},
	});

export const findSurveyByIdAndRecipient = async (surveyId: string, recipientId: string) =>
	prisma.survey.findUnique({
		where: { id: surveyId, recipientId },
		select: {
			id: true,
			name: true,
			questionnaire: true,
			status: true,
			data: true,
			language: true,
			recipient: {
				select: {
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
			},
		},
	});

export const findSurveySchedulesByProgramIds = async (programIds: string[]) =>
	prisma.surveySchedule.findMany({
		where: { programId: { in: programIds } },
		select: {
			id: true,
			name: true,
			questionnaire: true,
			dueInMonthsAfterStart: true,
			programId: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { dueInMonthsAfterStart: 'asc' },
	});

export const findExistingSurveyIdentities = async (recipientIds: string[]) =>
	prisma.survey.findMany({
		where: { recipientId: { in: recipientIds } },
		select: {
			recipientId: true,
			name: true,
			accessEmail: true,
		},
	});

export const findSurveyByRecipientAndName = async (recipientId: string, name: string) =>
	prisma.survey.findUnique({
		where: { recipientId_name: { recipientId, name } },
		select: { id: true },
	});

export const createSurvey = async (input: SurveyCreateData) =>
	prisma.survey.create({
		data: input,
		select: {
			id: true,
			name: true,
			questionnaire: true,
			language: true,
			dueAt: true,
			completedAt: true,
			status: true,
			data: true,
			accessEmail: true,
			accessPw: true,
			recipientId: true,
			surveyScheduleId: true,
			createdAt: true,
			updatedAt: true,
		},
	});

export const updateSurvey = async (surveyId: string, input: SurveyUpdateData | SurveyResponseUpdateInput) =>
	prisma.survey.update({
		where: { id: surveyId },
		data: input,
		select: {
			id: true,
			name: true,
			questionnaire: true,
			language: true,
			dueAt: true,
			completedAt: true,
			status: true,
			data: true,
			accessEmail: true,
			accessPw: true,
			recipientId: true,
			surveyScheduleId: true,
			createdAt: true,
			updatedAt: true,
		},
	});

export const findCompletedSurveyImpactSource = async (query: SurveyImpactQuery) =>
	prisma.survey.findMany({
		where: buildImpactWhere(query),
		select: {
			data: true,
			questionnaire: true,
			recipientId: true,
			recipient: {
				select: {
					programId: true,
					program: {
						select: {
							country: {
								select: {
									isoCode: true,
								},
							},
						},
					},
				},
			},
		},
		orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
	});

export const findSurveyImpactFilterSource = async () =>
	prisma.survey.findMany({
		where: { status: SurveyStatus.completed },
		select: {
			questionnaire: true,
			recipient: {
				select: {
					localPartner: {
						select: {
							focuses: {
								select: {
									focus: {
										select: {
											id: true,
											slug: true,
										},
									},
								},
							},
						},
					},
					program: {
						select: {
							id: true,
							name: true,
							country: {
								select: {
									isoCode: true,
								},
							},
						},
					},
				},
			},
		},
	});

export const findSurveyImpactStudySource = async (query: SurveyImpactQuery) =>
	prisma.survey.findMany({
		where: buildImpactWhere(query),
		select: {
			completedAt: true,
			recipientId: true,
			recipient: {
				select: {
					contact: {
						select: {
							gender: true,
							dateOfBirth: true,
						},
					},
					program: {
						select: {
							country: {
								select: {
									isoCode: true,
								},
							},
						},
					},
				},
			},
		},
		orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
	});

const normalizeOptionalFilter = (value: string | undefined): string | undefined => {
	const normalized = value?.trim();
	if (!normalized) {
		return undefined;
	}

	return normalized;
};

const buildSurveyOrderBy = (query: SurveyTableQuery): Prisma.SurveyOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'name',
		'recipientName',
		'programName',
		'questionnaire',
		'language',
		'status',
		'dueAt',
		'completedAt',
		'createdAt',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'name':
			return [{ name: direction }];
		case 'recipientName':
			return [{ recipient: { contact: { firstName: direction } } }, { recipient: { contact: { lastName: direction } } }];
		case 'programName':
			return [{ recipient: { program: { name: direction } } }];
		case 'questionnaire':
			return [{ questionnaire: direction }];
		case 'language':
			return [{ language: direction }];
		case 'status':
			return [{ status: direction }];
		case 'dueAt':
			return [{ dueAt: direction }];
		case 'completedAt':
			return [{ completedAt: direction }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ dueAt: 'desc' }];
	}
};

const buildImpactWhere = (query: SurveyImpactQuery): Prisma.SurveyWhereInput => {
	const contactWhere: Prisma.ContactWhereInput = {
		...(query.recipientGenders && query.recipientGenders.length > 0 ? { gender: { in: query.recipientGenders } } : {}),
		...(query.recipientBirthDateRanges && query.recipientBirthDateRanges.length > 0
			? { OR: query.recipientBirthDateRanges.map((range) => ({ dateOfBirth: range })) }
			: {}),
	};
	const hasRecipientFilters =
		Boolean(query.focusIds?.length) ||
		Boolean(query.programIds?.length) ||
		Boolean(query.countryIsoCodes?.length) ||
		Object.keys(contactWhere).length > 0;

	return {
		status: SurveyStatus.completed,
		...(query.questionnaires?.length ? { questionnaire: { in: query.questionnaires } } : {}),
		...(query.language ? { language: query.language } : {}),
		...(hasRecipientFilters
			? {
					recipient: {
						...(query.focusIds?.length ? { localPartner: { focuses: { some: { focusId: { in: query.focusIds } } } } } : {}),
						...(query.programIds?.length ? { programId: { in: query.programIds } } : {}),
						...(query.countryIsoCodes?.length ? { program: { country: { isoCode: { in: query.countryIsoCodes } } } } : {}),
						...(Object.keys(contactWhere).length > 0 ? { contact: contactWhere } : {}),
					},
				}
			: {}),
	};
};
