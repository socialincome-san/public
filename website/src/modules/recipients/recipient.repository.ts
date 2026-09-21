import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import type { CreateRecipientInput, UpdateRecipientInput, UpdateRecipientSelfInput } from './recipient.schemas';
import type { RecipientTableQuery } from './recipient.types';

export const findProgram = async (programId: string) =>
	prisma.program.findUnique({
		where: { id: programId },
		select: { id: true },
	});

export const findRecipientOwnership = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: {
			id: true,
			programId: true,
			localPartnerId: true,
		},
	});

export const findRecipient = async (recipientId: string) =>
	prisma.recipient.findUnique({
		where: { id: recipientId },
		select: recipientDetailSelect,
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

export const findLocalPartnerOptions = async () =>
	prisma.localPartner.findMany({
		select: {
			id: true,
			name: true,
		},
		orderBy: { name: 'asc' },
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
	query,
	canSearchRecipientNames,
	paginate,
}: {
	programIds: string[];
	query: RecipientTableQuery;
	canSearchRecipientNames: boolean;
	paginate: boolean;
}) => {
	const selectedProgramId = normalizeOptionalFilter(query.programId);
	const filteredProgramIds = selectedProgramId
		? programIds.filter((programId) => programId === selectedProgramId)
		: programIds;
	const where = buildRecipientTableWhere(filteredProgramIds, query.search, canSearchRecipientNames);
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

export const findAllRecipientTableSource = async (programIds: string[]) =>
	prisma.recipient.findMany({
		where: {
			programId: { in: programIds },
		},
		select: recipientTableSelect,
		orderBy: { createdAt: 'desc' },
	});

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

export const createRecipient = async (input: CreateRecipientInput) => {
	const data = buildRecipientCreateData(input);

	return prisma.$transaction((transaction) => transaction.recipient.create({ data }));
};

export const updateRecipient = async (input: UpdateRecipientInput, context: RecipientUpdatePersistenceContext) =>
	prisma.recipient.update({
		where: { id: input.id },
		data: buildRecipientUpdateData(input, context),
	});

export const updateRecipientSelf = async (
	recipientId: string,
	input: UpdateRecipientSelfInput,
	currentPaymentCode: string | null,
) =>
	prisma.recipient.update({
		where: { id: recipientId },
		data: buildRecipientSelfUpdateData(input, currentPaymentCode),
		select: recipientWithPaymentInformationSelect,
	});

export const removeRecipientFromProgram = async (recipientId: string, expectedProgramId: string) =>
	prisma.recipient.updateMany({
		where: {
			id: recipientId,
			programId: expectedProgramId,
			payouts: { none: {} },
		},
		data: {
			programId: null,
			startDate: null,
		},
	});

export const deleteRecipient = async ({
	recipientId,
	contactId,
	paymentInformationId,
}: {
	recipientId: string;
	contactId: string;
	paymentInformationId: string | null;
}) =>
	prisma.$transaction(async (transaction) => {
		await transaction.recipient.delete({
			where: { id: recipientId },
		});

		if (paymentInformationId) {
			await transaction.paymentInformation.delete({
				where: { id: paymentInformationId },
			});
		}

		await transaction.contact.delete({
			where: { id: contactId },
		});

		return { id: recipientId };
	});

export const deletePhoneIfOrphaned = async (phoneId: string) => {
	const phone = await prisma.phone.findUnique({
		where: { id: phoneId },
		select: {
			_count: {
				select: {
					contacts: true,
					paymentInformations: true,
				},
			},
		},
	});

	if (!phone || phone._count.contacts > 0 || phone._count.paymentInformations > 0) {
		return false;
	}

	await prisma.phone.delete({
		where: { id: phoneId },
	});

	return true;
};

export const deleteAddressIfOrphaned = async (addressId: string) => {
	const address = await prisma.address.findUnique({
		where: { id: addressId },
		select: {
			_count: {
				select: {
					contacts: true,
				},
			},
		},
	});

	if (!address || address._count.contacts > 0) {
		return false;
	}

	await prisma.address.delete({
		where: { id: addressId },
	});

	return true;
};

type RecipientUpdatePersistenceContext = {
	contactId: string;
	contactPhoneId: string | undefined;
	contactPhoneNumber: string | undefined;
	contactAddressId: string | undefined;
	paymentInformationId: string | undefined;
	paymentPhoneId: string | undefined;
	paymentPhoneNumber: string | undefined;
};

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

const recipientWithPaymentInformationSelect = {
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
	searchInput: string,
	canSearchRecipientNames: boolean,
): Prisma.RecipientWhereInput => {
	const search = searchInput.trim();
	const baseWhere: Prisma.RecipientWhereInput = {
		programId: { in: programIds },
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

const buildRecipientCreateData = (input: CreateRecipientInput): Prisma.RecipientCreateInput => {
	if (!input.programId || !input.localPartnerId) {
		throw new Error('Recipient persistence requires a program and local partner');
	}

	return {
		startDate: input.startDate ?? null,
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		program: { connect: { id: input.programId } },
		localPartner: { connect: { id: input.localPartnerId } },
		contact: { create: buildContactCreateData(input) },
		paymentInformation: buildPaymentInformationCreateData(input),
	};
};

const buildContactCreateData = (input: CreateRecipientInput): Prisma.ContactCreateWithoutRecipientInput => ({
	firstName: input.contact.firstName,
	lastName: input.contact.lastName,
	callingName: input.contact.callingName,
	email: input.contact.email,
	gender: input.contact.gender,
	language: input.contact.language,
	dateOfBirth: input.contact.dateOfBirth,
	profession: input.contact.profession,
	phone: input.contact.phone
		? {
				create: {
					number: input.contact.phone,
					hasWhatsApp: input.contact.hasWhatsApp,
				},
			}
		: undefined,
	address: buildAddressCreateOperation(input),
});

const buildPaymentInformationCreateData = (
	input: CreateRecipientInput,
): Prisma.PaymentInformationCreateNestedOneWithoutRecipientsInput | undefined => {
	const { mobileMoneyProviderId, code, phone } = input.paymentInformation;
	if (!mobileMoneyProviderId && !code && !phone) {
		return undefined;
	}

	return {
		create: {
			mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : undefined,
			code: code ?? null,
			phone: phone ? { create: { number: phone } } : undefined,
		},
	};
};

const buildRecipientUpdateData = (
	input: UpdateRecipientInput,
	context: RecipientUpdatePersistenceContext,
): Prisma.RecipientUpdateInput => {
	const paymentInformation = buildPaymentInformationUpdateOperation(input, context);

	return {
		startDate: input.startDate ?? null,
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		program: input.programId ? { connect: { id: input.programId } } : undefined,
		localPartner: input.localPartnerId ? { connect: { id: input.localPartnerId } } : undefined,
		contact: {
			update: {
				where: { id: context.contactId },
				data: {
					firstName: input.contact.firstName,
					lastName: input.contact.lastName,
					callingName: input.contact.callingName,
					email: input.contact.email,
					gender: input.contact.gender,
					language: input.contact.language,
					dateOfBirth: input.contact.dateOfBirth,
					profession: input.contact.profession,
					phone: buildContactPhoneUpdateOperation(input, context),
					address: buildAddressUpdateOperation(input, context.contactAddressId),
				},
			},
		},
		paymentInformation,
	};
};

const buildContactPhoneUpdateOperation = (
	input: UpdateRecipientInput,
	context: RecipientUpdatePersistenceContext,
): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined => {
	const nextPhoneNumber = input.contact.phone;
	if (nextPhoneNumber) {
		if (context.contactPhoneId && context.contactPhoneNumber === nextPhoneNumber) {
			return {
				update: {
					where: { id: context.contactPhoneId },
					data: { hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}

		if (context.contactPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhoneNumber },
					create: {
						number: nextPhoneNumber,
						hasWhatsApp: input.contact.hasWhatsApp,
					},
				},
			};
		}

		return {
			create: {
				number: nextPhoneNumber,
				hasWhatsApp: input.contact.hasWhatsApp,
			},
		};
	}

	return context.contactPhoneId ? { disconnect: true } : undefined;
};

const buildPaymentInformationUpdateOperation = (
	input: UpdateRecipientInput,
	context: RecipientUpdatePersistenceContext,
): Prisma.PaymentInformationUpdateOneWithoutRecipientsNestedInput | undefined => {
	const { mobileMoneyProviderId, code, phone } = input.paymentInformation;
	const hasPaymentPayload = Boolean(mobileMoneyProviderId ?? code ?? phone);
	const create = {
		mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : undefined,
		code: code ?? null,
		phone: phone ? { create: { number: phone } } : undefined,
	};

	if (!context.paymentInformationId) {
		return hasPaymentPayload ? { create } : undefined;
	}

	return {
		upsert: {
			where: { id: context.paymentInformationId },
			create,
			update: {
				mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : { disconnect: true },
				code: code ?? null,
				phone: buildPaymentPhoneUpdateOperation(phone, context),
			},
		},
	};
};

const buildPaymentPhoneUpdateOperation = (
	nextPhoneNumber: string | undefined,
	context: RecipientUpdatePersistenceContext,
): Prisma.PhoneUpdateOneWithoutPaymentInformationsNestedInput | undefined => {
	if (nextPhoneNumber) {
		if (context.paymentPhoneId && context.paymentPhoneNumber === nextPhoneNumber) {
			return undefined;
		}

		if (context.paymentPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhoneNumber },
					create: { number: nextPhoneNumber },
				},
			};
		}

		return { create: { number: nextPhoneNumber } };
	}

	return context.paymentPhoneId ? { disconnect: true } : undefined;
};

const buildAddressCreateOperation = (
	input: CreateRecipientInput,
): Prisma.AddressCreateNestedOneWithoutContactsInput | undefined => {
	const address = buildAddressData(input.contact);

	return address ? { create: address } : undefined;
};

const buildAddressUpdateOperation = (
	input: UpdateRecipientInput,
	currentAddressId: string | undefined,
): Prisma.AddressUpdateOneWithoutContactsNestedInput | undefined => {
	const address = buildAddressData(input.contact);
	if (address) {
		return currentAddressId
			? {
					upsert: {
						where: { id: currentAddressId },
						update: address,
						create: address,
					},
				}
			: { create: address };
	}

	return currentAddressId ? { disconnect: true } : undefined;
};

const buildAddressData = (contact: CreateRecipientInput['contact']) => {
	if (![contact.street, contact.number, contact.city, contact.zip, contact.country].some(Boolean)) {
		return undefined;
	}

	return {
		street: contact.street ?? '',
		number: contact.number ?? '',
		city: contact.city ?? '',
		zip: contact.zip ?? '',
		country: contact.country,
	};
};

const buildRecipientSelfUpdateData = (
	input: UpdateRecipientSelfInput,
	currentPaymentCode: string | null,
): Prisma.RecipientUpdateInput => ({
	contact: {
		update: {
			firstName: input.firstName,
			lastName: input.lastName,
			callingName: input.callingName,
			gender: input.gender,
			dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
			language: input.language,
			email: input.email,
			phone:
				input.contactPhone === null
					? { disconnect: true }
					: input.contactPhone
						? {
								connectOrCreate: {
									where: { number: input.contactPhone },
									create: { number: input.contactPhone },
								},
							}
						: undefined,
		},
	},
	successorName: input.successorName,
	termsAccepted: input.termsAccepted,
	paymentInformation:
		input.paymentPhone || input.paymentProvider
			? {
					upsert: {
						update: {
							mobileMoneyProvider: input.paymentProvider ? { connect: { id: input.paymentProvider } } : { disconnect: true },
							phone: input.paymentPhone
								? {
										connectOrCreate: {
											where: { number: input.paymentPhone },
											create: { number: input.paymentPhone },
										},
									}
								: undefined,
						},
						create: {
							mobileMoneyProvider: input.paymentProvider ? { connect: { id: input.paymentProvider } } : undefined,
							code: currentPaymentCode ?? '',
							phone: input.paymentPhone
								? {
										connectOrCreate: {
											where: { number: input.paymentPhone },
											create: { number: input.paymentPhone },
										},
									}
								: undefined,
						},
					},
				}
			: undefined,
});
