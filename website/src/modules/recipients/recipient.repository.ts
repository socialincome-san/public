import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import type { RecipientTableQuery } from './recipient.types';

export const findRecipientMonthlySummarySource = async (from: Date, to: Date) => {
	const [newRecipientCount, recipients] = await Promise.all([
		prisma.recipient.count({
			where: { createdAt: { gte: from, lt: to } },
		}),
		prisma.recipient.findMany({
			select: {
				programId: true,
				startDate: true,
				suspendedAt: true,
				program: {
					select: {
						programDurationInMonths: true,
						payoutInterval: true,
						country: { select: { isoCode: true } },
					},
				},
				localPartner: { select: { name: true } },
				payouts: { select: { status: true } },
			},
		}),
	]);

	return { newRecipientCount, recipients };
};

export const findRecipientOwnership = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: {
			id: true,
			programId: true,
			localPartnerId: true,
		},
	});

export const findPayoutProcessRecipients = async (programIds: string[], mobileMoneyProviderIds: string[]) =>
	prisma.recipient.findMany({
		where: {
			programId: { in: programIds },
			paymentInformation: { mobileMoneyProviderId: { in: mobileMoneyProviderIds } },
		},
		select: {
			id: true,
			startDate: true,
			suspendedAt: true,
			contact: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
			paymentInformation: {
				select: {
					code: true,
					phone: { select: { number: true } },
					mobileMoneyProvider: { select: { name: true } },
				},
			},
			program: {
				select: {
					payoutPerInterval: true,
					programDurationInMonths: true,
					payoutInterval: true,
					country: {
						select: {
							currency: true,
							isoCode: true,
						},
					},
				},
			},
			payouts: {
				select: {
					paymentAt: true,
					status: true,
				},
			},
		},
		orderBy: [{ paymentInformation: { code: 'asc' } }, { id: 'asc' }],
	});

export const findRecipient = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: recipientDetailSelect,
	});

export const findRecipientVersions = async (recipientId: string) =>
	prisma.entityVersion.findMany({
		where: { entityType: 'recipient', entityId: recipientId },
		orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		select: {
			id: true,
			action: true,
			actorType: true,
			actorId: true,
			source: true,
			snapshot: true,
			metadata: true,
			createdAt: true,
		},
	});

export const findRecipientForUpdate = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: recipientUpdateContextSelect,
	});

export const findRecipientForSelfUpdate = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: {
			contact: {
				select: {
					phone: { select: { id: true } },
				},
			},
			paymentInformation: {
				select: {
					code: true,
					phone: { select: { id: true, number: true } },
				},
			},
		},
	});

export const findRecipientForProgramRemoval = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: {
			id: true,
			programId: true,
			_count: { select: { payouts: true } },
		},
	});

export const findRecipientForDeletion = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: {
			id: true,
			contactId: true,
			paymentInformationId: true,
			programId: true,
			localPartnerId: true,
			contact: {
				select: {
					phoneId: true,
					addressId: true,
				},
			},
			paymentInformation: {
				select: {
					phone: { select: { id: true, number: true } },
				},
			},
		},
	});

export const findContactByEmail = async (email: string) =>
	prisma.contact.findUnique({
		where: { email },
		select: { id: true },
	});

export const findPhoneByNumber = async (number: string) =>
	prisma.phone.findUnique({
		where: { number },
		select: { id: true },
	});

export const findPaymentInformationByCode = async (code: string) =>
	prisma.paymentInformation.findUnique({
		where: { code },
		select: { id: true },
	});

export const findRecipientByPaymentPhoneNumber = async (phoneNumber: string) =>
	prisma.recipient.findFirst({
		where: {
			paymentInformation: {
				phone: {
					number: phoneNumber,
				},
			},
		},
		select: recipientWithPaymentInformationSelect,
	});

export const findEditableRecipientOptions = async (programIds: string[]) =>
	prisma.recipient.findMany({
		where: { programId: { in: programIds } },
		select: {
			id: true,
			contact: { select: { firstName: true, lastName: true } },
		},
		orderBy: [{ contact: { firstName: 'asc' } }],
	});

export const findRecipientFilterOption = async (recipientId: string, programIds: string[]) =>
	prisma.recipient.findFirst({
		where: { id: recipientId, programId: { in: programIds } },
		select: { id: true, contact: { select: { firstName: true, lastName: true } } },
	});

export const findSurveyRecipients = async (programIds: string[], currentDate: Date) =>
	prisma.recipient.findMany({
		where: {
			programId: { in: programIds },
			suspendedAt: null,
			startDate: { lte: currentDate },
		},
		select: {
			id: true,
			programId: true,
			startDate: true,
			contact: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
			program: {
				select: {
					name: true,
				},
			},
		},
	});

export const findRecipientMessagingTargets = async (recipientIds: string[]) =>
	prisma.recipient.findMany({
		where: { id: { in: recipientIds } },
		select: {
			contactId: true,
			contact: {
				select: {
					phone: {
						select: {
							number: true,
							hasWhatsApp: true,
						},
					},
				},
			},
			paymentInformation: {
				select: {
					phone: {
						select: {
							number: true,
							hasWhatsApp: true,
						},
					},
				},
			},
		},
	});

export const findRecipientsForCsvExport = async ({
	programIds,
	localPartnerId,
}: {
	programIds?: string[];
	localPartnerId?: string;
}) =>
	prisma.recipient.findMany({
		where: localPartnerId
			? {
					localPartnerId,
					programId: { not: null },
				}
			: {
					programId: { in: programIds ?? [] },
				},
		select: recipientCsvSelect,
		orderBy: [{ id: 'asc' }],
	});

export const findPublicRecipientTableSource = async (programId: string, maximumRows: number) => {
	const where: Prisma.RecipientWhereInput = { programId };
	const [recipients, totalCount] = await Promise.all([
		prisma.recipient.findMany({
			where,
			select: publicRecipientTableSelect,
			orderBy: [{ startDate: 'asc' }],
			take: maximumRows,
		}),
		prisma.recipient.count({ where }),
	]);

	return { recipients, totalCount };
};

export const findRecipientTableSource = async ({
	programIds,
	localPartnerId,
	query,
	canSearchRecipientNames,
	paginate,
}: {
	programIds: string[];
	localPartnerId: string | undefined;
	query: RecipientTableQuery;
	canSearchRecipientNames: boolean;
	paginate: boolean;
}) => {
	const selectedProgramId = normalizeOptionalFilter(query.programId);
	const filteredProgramIds = selectedProgramId
		? programIds.filter((programId) => programId === selectedProgramId)
		: programIds;
	const where = buildRecipientTableWhere(filteredProgramIds, localPartnerId, query.search, canSearchRecipientNames);
	if (paginate) {
		const [recipients, totalCount] = await Promise.all([
			prisma.recipient.findMany({
				where,
				select: recipientTableSelect,
				orderBy: buildRecipientOrderBy(query),
				skip: (query.page - 1) * query.pageSize,
				take: query.pageSize,
			}),
			prisma.recipient.count({ where }),
		]);

		return { recipients, totalCount, filteredProgramIds };
	}

	const [recipients, totalCount] = await Promise.all([
		prisma.recipient.findMany({
			where,
			select: recipientTableSelect,
			orderBy: buildRecipientOrderBy(query),
		}),
		prisma.recipient.count({ where }),
	]);

	return { recipients, totalCount, filteredProgramIds };
};

export const findUpcomingOnboardingRecipientTableSource = async ({
	programIds,
	query,
	startOfToday,
}: {
	programIds: string[];
	query: RecipientTableQuery;
	startOfToday: Date;
}) => {
	const selectedProgramId = normalizeOptionalFilter(query.programId);
	const filteredProgramIds = selectedProgramId
		? programIds.filter((programId) => programId === selectedProgramId)
		: programIds;
	const where = buildUpcomingOnboardingWhere(filteredProgramIds, query.search, startOfToday);
	const [recipients, totalCount] = await Promise.all([
		prisma.recipient.findMany({
			where,
			select: upcomingOnboardingRecipientSelect,
			orderBy: buildUpcomingOnboardingOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.recipient.count({ where }),
	]);

	return { recipients, totalCount, filteredProgramIds };
};

export const findLocalPartnerRecipientTableSource = async ({
	localPartnerId,
	query,
	paginate,
}: {
	localPartnerId: string;
	query: RecipientTableQuery;
	paginate: boolean;
}) => {
	const selectedProgramId = normalizeOptionalFilter(query.programId);
	const where = buildLocalPartnerRecipientTableWhere(localPartnerId, selectedProgramId, query.search);
	if (paginate) {
		const [recipients, totalCount] = await Promise.all([
			prisma.recipient.findMany({
				where,
				select: recipientTableSelect,
				orderBy: buildRecipientOrderBy(query),
				skip: (query.page - 1) * query.pageSize,
				take: query.pageSize,
			}),
			prisma.recipient.count({ where }),
		]);

		return { recipients, totalCount };
	}

	const [recipients, totalCount] = await Promise.all([
		prisma.recipient.findMany({
			where,
			select: recipientTableSelect,
			orderBy: buildRecipientOrderBy(query),
		}),
		prisma.recipient.count({ where }),
	]);

	return { recipients, totalCount };
};

export const findLocalPartnerRecipientProgramFilterSource = async (localPartnerId: string) =>
	prisma.recipient.findMany({
		where: {
			localPartnerId,
			programId: { not: null },
		},
		select: {
			program: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

export const findUnassignedRecipientCountries = async () =>
	prisma.recipient.findMany({
		where: { programId: null },
		select: {
			contact: {
				select: {
					address: {
						select: {
							country: true,
						},
					},
				},
			},
			localPartner: {
				select: {
					contact: {
						select: {
							address: {
								select: {
									country: true,
								},
							},
						},
					},
				},
			},
		},
	});

export const countRecipientsForProgramsAndLocalPartners = async (programIds: string[], localPartnerIds: string[]) =>
	prisma.recipient.count({
		where: {
			programId: { in: programIds },
			localPartnerId: { in: localPartnerIds },
		},
	});

export const countCandidatesForLocalPartners = async (localPartnerIds: string[]) =>
	prisma.recipient.count({
		where: {
			programId: null,
			localPartnerId: { in: localPartnerIds },
		},
	});

const recipientDetailSelect = {
	id: true,
	startDate: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
	localPartner: {
		select: {
			id: true,
			name: true,
		},
	},
	program: {
		select: {
			id: true,
			name: true,
		},
	},
	contact: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			callingName: true,
			email: true,
			gender: true,
			language: true,
			dateOfBirth: true,
			profession: true,
			phone: true,
			address: true,
		},
	},
	paymentInformation: {
		select: {
			id: true,
			code: true,
			mobileMoneyProvider: { select: { id: true, name: true } },
			phone: true,
		},
	},
} satisfies Prisma.RecipientSelect;

const recipientUpdateContextSelect = {
	programId: true,
	localPartnerId: true,
	contact: {
		select: {
			id: true,
			email: true,
			phone: { select: { id: true, number: true } },
			address: { select: { id: true } },
		},
	},
	paymentInformation: {
		select: {
			id: true,
			code: true,
			phone: { select: { id: true, number: true } },
		},
	},
} satisfies Prisma.RecipientSelect;

const recipientTableSelect = {
	id: true,
	startDate: true,
	suspendedAt: true,
	suspensionReason: true,
	paymentInformation: {
		select: {
			code: true,
		},
	},
	contact: {
		select: {
			firstName: true,
			lastName: true,
			dateOfBirth: true,
			address: {
				select: {
					country: true,
				},
			},
		},
	},
	program: {
		select: {
			id: true,
			name: true,
			programDurationInMonths: true,
			payoutInterval: true,
		},
	},
	localPartner: {
		select: {
			name: true,
			account: {
				select: {
					firebaseAuthUserId: true,
				},
			},
			contact: {
				select: {
					address: {
						select: {
							country: true,
						},
					},
				},
			},
		},
	},
	payouts: {
		select: { status: true },
	},
	createdAt: true,
} satisfies Prisma.RecipientSelect;

const publicRecipientTableSelect = {
	startDate: true,
	suspendedAt: true,
	contact: {
		select: {
			dateOfBirth: true,
			address: {
				select: {
					country: true,
				},
			},
		},
	},
	program: {
		select: {
			programDurationInMonths: true,
			payoutInterval: true,
		},
	},
	localPartner: {
		select: {
			name: true,
			contact: {
				select: {
					address: {
						select: {
							country: true,
						},
					},
				},
			},
		},
	},
	payouts: {
		select: { status: true },
	},
	createdAt: true,
} satisfies Prisma.RecipientSelect;

const upcomingOnboardingRecipientSelect = {
	id: true,
	startDate: true,
	createdAt: true,
	contact: {
		select: {
			firstName: true,
			lastName: true,
			phone: {
				select: {
					number: true,
				},
			},
		},
	},
	program: {
		select: {
			id: true,
			name: true,
		},
	},
	localPartner: {
		select: {
			name: true,
		},
	},
} satisfies Prisma.RecipientSelect;

const recipientCsvSelect = {
	id: true,
	startDate: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
	createdAt: true,
	updatedAt: true,
	program: {
		select: {
			id: true,
			name: true,
		},
	},
	localPartner: {
		select: {
			id: true,
			name: true,
		},
	},
	contact: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			callingName: true,
			email: true,
			gender: true,
			language: true,
			dateOfBirth: true,
			profession: true,
			phone: { select: { number: true } },
			address: {
				select: {
					street: true,
					number: true,
					zip: true,
					city: true,
					country: true,
				},
			},
		},
	},
	paymentInformation: {
		select: {
			id: true,
			code: true,
			phone: { select: { number: true } },
			mobileMoneyProvider: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
} satisfies Prisma.RecipientSelect;

const recipientContactRecordSelect = {
	id: true,
	firstName: true,
	lastName: true,
	callingName: true,
	phoneId: true,
	phone: true,
	email: true,
	gender: true,
	language: true,
	dateOfBirth: true,
	profession: true,
	isInstitution: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.ContactSelect;

export const recipientWithPaymentInformationSelect = {
	id: true,
	legacyFirestoreId: true,
	contactId: true,
	startDate: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
	paymentInformationId: true,
	programId: true,
	localPartnerId: true,
	createdAt: true,
	updatedAt: true,
	contact: {
		select: recipientContactRecordSelect,
	},
	paymentInformation: {
		select: {
			id: true,
			code: true,
			mobileMoneyProviderId: true,
			phoneId: true,
			createdAt: true,
			updatedAt: true,
			phone: true,
			mobileMoneyProvider: true,
		},
	},
	program: {
		select: {
			id: true,
			name: true,
			slug: true,
			amountOfRecipientsForStart: true,
			coveredByReserves: true,
			programDurationInMonths: true,
			payoutPerInterval: true,
			payoutInterval: true,
			targetProfiles: true,
			countryId: true,
			createdAt: true,
			updatedAt: true,
			country: {
				select: {
					isoCode: true,
					currency: true,
				},
			},
		},
	},
	localPartner: {
		select: {
			id: true,
			accountId: true,
			legacyFirestoreId: true,
			name: true,
			slug: true,
			contactId: true,
			createdAt: true,
			updatedAt: true,
			contact: {
				select: recipientContactRecordSelect,
			},
		},
	},
} satisfies Prisma.RecipientSelect;

const buildRecipientTableWhere = (
	programIds: string[],
	localPartnerId: string | undefined,
	searchInput: string,
	canSearchRecipientNames: boolean,
): Prisma.RecipientWhereInput => {
	const search = searchInput.trim();
	const baseWhere: Prisma.RecipientWhereInput = {
		programId: { in: programIds },
		...(localPartnerId ? { localPartnerId } : {}),
	};

	if (!search) {
		return baseWhere;
	}

	const nameFilters: Prisma.RecipientWhereInput[] = canSearchRecipientNames
		? [
				{ contact: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
				{ contact: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
			]
		: [];

	return {
		AND: [
			baseWhere,
			{
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					...nameFilters,
					{ paymentInformation: { is: { code: { contains: search, mode: 'insensitive' } } } },
					{ localPartner: { is: { name: { contains: search, mode: 'insensitive' } } } },
					{ program: { is: { name: { contains: search, mode: 'insensitive' } } } },
				],
			},
		],
	};
};

const buildLocalPartnerRecipientTableWhere = (
	localPartnerId: string,
	selectedProgramId: string | undefined,
	searchInput: string,
): Prisma.RecipientWhereInput => {
	const baseWhere: Prisma.RecipientWhereInput = {
		localPartnerId,
		programId: selectedProgramId ?? { not: null },
	};
	const search = searchInput.trim();

	if (!search) {
		return baseWhere;
	}

	return {
		AND: [
			baseWhere,
			{
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contact: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
					{ contact: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
					{ paymentInformation: { is: { code: { contains: search, mode: 'insensitive' } } } },
					{ program: { is: { name: { contains: search, mode: 'insensitive' } } } },
				],
			},
		],
	};
};

const buildUpcomingOnboardingWhere = (
	programIds: string[],
	searchInput: string,
	startOfToday: Date,
): Prisma.RecipientWhereInput => {
	const baseWhere: Prisma.RecipientWhereInput = {
		programId: { in: programIds },
		startDate: { not: null, gte: startOfToday },
	};
	const search = searchInput.trim();

	if (!search) {
		return baseWhere;
	}

	return {
		AND: [
			baseWhere,
			{
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contact: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
					{ contact: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
					{ program: { is: { name: { contains: search, mode: 'insensitive' } } } },
					{ localPartner: { is: { name: { contains: search, mode: 'insensitive' } } } },
					{ contact: { is: { phone: { is: { number: { contains: search, mode: 'insensitive' } } } } } },
				],
			},
		],
	};
};

const buildRecipientOrderBy = (query: RecipientTableQuery): Prisma.RecipientOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';

	switch (query.sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'recipient':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
		case 'country':
			return [{ contact: { address: { country: direction } } }];
		case 'paymentCode':
			return [{ paymentInformation: { code: direction } }];
		case 'dateOfBirth':
			return [{ contact: { dateOfBirth: direction } }];
		case 'localPartnerName':
			return [{ localPartner: { name: direction } }];
		case 'programName':
			return [{ program: { name: direction } }];
		case 'startDate':
			return [{ startDate: direction }];
		case 'status':
			return [{ createdAt: 'desc' }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ createdAt: 'desc' }];
	}
};

const buildUpcomingOnboardingOrderBy = (query: RecipientTableQuery): Prisma.RecipientOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'desc' ? 'desc' : 'asc';

	switch (query.sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'recipientName':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
		case 'programName':
			return [{ program: { name: direction } }];
		case 'localPartnerName':
			return [{ localPartner: { name: direction } }];
		case 'communicationPhoneNumber':
			return [{ contact: { phone: { number: direction } } }];
		case 'daysUntilStart':
		case 'startDate':
			return [{ startDate: direction }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ startDate: 'asc' }];
	}
};

const normalizeOptionalFilter = (value: string | undefined): string | undefined => {
	const normalizedValue = value?.trim();
	if (!normalizedValue) {
		return undefined;
	}

	return normalizedValue;
};
