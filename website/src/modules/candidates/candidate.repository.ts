import type { Prisma } from '@/generated/prisma/client';
import { Gender, Profile, type CountryCode } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { CandidateCreateInput, CandidateUpdateInput } from './candidate.schemas';
import type { CandidatesTableQuery } from './candidate.types';

export const findCandidateById = async (candidateId: string) =>
	prisma.recipient.findUnique({
		where: { id: candidateId },
		select: {
			...candidatePayloadSelect,
			programId: true,
			localPartnerId: true,
		},
	});

export const findPaginatedCandidates = async ({
	query,
	localPartnerId,
	country,
	gender,
}: {
	query: CandidatesTableQuery;
	localPartnerId?: string;
	country?: CountryCode;
	gender?: Gender;
}) => {
	const where = buildCandidateTableWhere(query.search, localPartnerId ?? query.localPartnerId, country, gender);
	const filterWhere: Prisma.RecipientWhereInput = {
		programId: null,
		...(localPartnerId ? { localPartnerId } : {}),
	};

	const [candidates, totalCount, filterSource] = await Promise.all([
		prisma.recipient.findMany({
			where,
			select: candidateTableSelect,
			orderBy: buildCandidateOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.recipient.count({ where }),
		prisma.recipient.findMany({
			where: filterWhere,
			select: candidateFilterSelect,
		}),
	]);

	return { candidates, totalCount, filterSource };
};

export const findCandidateForUpdate = async (candidateId: string) =>
	prisma.recipient.findUnique({
		where: { id: candidateId },
		select: {
			localPartnerId: true,
			programId: true,
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
		},
	});

export const findCandidateForDeletion = async (candidateId: string) =>
	prisma.recipient.findUnique({
		where: { id: candidateId },
		select: {
			id: true,
			contactId: true,
			paymentInformationId: true,
			programId: true,
			localPartnerId: true,
			contact: { select: { phoneId: true, addressId: true } },
			paymentInformation: { select: { phone: { select: { id: true, number: true } } } },
		},
	});

export const findCandidatesForCsvExport = async (localPartnerId?: string) =>
	prisma.recipient.findMany({
		where: {
			programId: null,
			...(localPartnerId ? { localPartnerId } : {}),
		},
		select: candidateCsvSelect,
		orderBy: { createdAt: 'desc' },
	});

export const findContactByEmail = async (email: string) =>
	prisma.contact.findUnique({ where: { email }, select: { id: true } });

export const findPhoneByNumber = async (number: string) =>
	prisma.phone.findUnique({ where: { number }, select: { id: true } });

export const findPaymentInformationByCode = async (code: string) =>
	prisma.paymentInformation.findUnique({ where: { code }, select: { id: true } });

export const createCandidate = async (input: CandidateCreateInput, localPartnerId: string) =>
	prisma.recipient.create({
		data: buildCandidateCreateData(input, localPartnerId),
		select: candidatePayloadSelect,
	});

export const updateCandidate = async (input: CandidateUpdateInput, context: CandidateUpdatePersistenceContext) =>
	prisma.recipient.update({
		where: { id: input.id },
		data: buildCandidateUpdateData(input, context),
		select: candidatePayloadSelect,
	});

export const deleteCandidateData = async ({
	candidateId,
	contactId,
	paymentInformationId,
}: {
	candidateId: string;
	contactId: string;
	paymentInformationId: string | null;
}) =>
	prisma.$transaction(async (transaction) => {
		await transaction.recipient.delete({ where: { id: candidateId } });
		if (paymentInformationId) {
			await transaction.paymentInformation.delete({ where: { id: paymentInformationId } });
		}
		await transaction.contact.delete({ where: { id: contactId } });
	});

export const deletePhoneIfOrphaned = async (phoneId: string) => {
	const phone = await prisma.phone.findUnique({
		where: { id: phoneId },
		select: { _count: { select: { contacts: true, paymentInformations: true } } },
	});
	if (!phone || phone._count.contacts > 0 || phone._count.paymentInformations > 0) {
		return false;
	}

	await prisma.phone.delete({ where: { id: phoneId } });

	return true;
};

export const deleteAddressIfOrphaned = async (addressId: string) => {
	const address = await prisma.address.findUnique({
		where: { id: addressId },
		select: { _count: { select: { contacts: true } } },
	});
	if (!address || address._count.contacts > 0) {
		return false;
	}

	await prisma.address.delete({ where: { id: addressId } });

	return true;
};

export const countCandidates = async (focuses?: string[], profiles?: Profile[], countryCode?: CountryCode | null) =>
	prisma.recipient.count({ where: buildCandidateWhere(focuses, profiles, countryCode) });

export const findCandidateIdsForAssignment = async (
	focuses: string[] | undefined,
	profiles: Profile[] | undefined,
	countryCode: CountryCode,
) =>
	prisma.recipient.findMany({
		where: buildCandidateWhere(focuses, profiles, countryCode),
		select: { id: true },
	});

export const updateCandidateProgramAssignments = async (candidateIds: string[], programId: string) =>
	prisma.recipient.updateMany({
		where: { id: { in: candidateIds } },
		data: { programId },
	});

type CandidateUpdatePersistenceContext = {
	contactId: string;
	contactPhoneId: string | undefined;
	contactPhoneNumber: string | undefined;
	contactAddressId: string | undefined;
	paymentInformationId: string | undefined;
	paymentPhoneId: string | undefined;
	paymentPhoneNumber: string | undefined;
};

const candidatePayloadSelect = {
	id: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
	localPartner: { select: { id: true, name: true } },
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
} as const;

const candidateTableSelect = {
	id: true,
	suspendedAt: true,
	suspensionReason: true,
	contact: {
		select: {
			firstName: true,
			lastName: true,
			dateOfBirth: true,
			gender: true,
			address: { select: { country: true } },
			phone: { select: { number: true } },
		},
	},
	localPartner: {
		select: {
			id: true,
			name: true,
			contact: { select: { address: { select: { country: true } } } },
		},
	},
} as const;

const candidateFilterSelect = {
	contact: {
		select: {
			gender: true,
			address: { select: { country: true } },
		},
	},
	localPartner: {
		select: {
			id: true,
			name: true,
			contact: { select: { address: { select: { country: true } } } },
		},
	},
} as const;

const candidateCsvSelect = {
	id: true,
	createdAt: true,
	updatedAt: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
	localPartner: {
		select: {
			id: true,
			name: true,
			contact: { select: { address: { select: { country: true } } } },
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
			mobileMoneyProvider: { select: { id: true, name: true } },
		},
	},
} as const;

const buildCandidateOrderBy = (query: CandidatesTableQuery): Prisma.RecipientOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'candidate',
		'country',
		'gender',
		'dateOfBirth',
		'contactNumber',
		'localPartnerName',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'candidate':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
		case 'country':
			return [{ contact: { address: { country: direction } } }];
		case 'gender':
			return [{ contact: { gender: direction } }];
		case 'dateOfBirth':
			return [{ contact: { dateOfBirth: direction } }];
		case 'contactNumber':
			return [{ contact: { phone: { number: direction } } }];
		case 'localPartnerName':
			return [{ localPartner: { name: direction } }];
		default:
			return [{ createdAt: 'desc' }];
	}
};

const buildCandidateTableWhere = (
	searchInput: string,
	localPartnerIdInput: string | undefined,
	country: CountryCode | undefined,
	gender: Gender | undefined,
): Prisma.RecipientWhereInput => {
	const search = searchInput.trim();
	const trimmedLocalPartnerId = localPartnerIdInput?.trim();
	const localPartnerId = trimmedLocalPartnerId === '' ? undefined : trimmedLocalPartnerId;
	const baseScope: Prisma.RecipientWhereInput = {
		programId: null,
		...(localPartnerId ? { localPartnerId } : {}),
		...(gender ? { contact: { gender } } : {}),
	};
	const countryScope = country ? buildCountryFilter(country) : null;

	if (!search) {
		return countryScope ? { AND: [baseScope, countryScope] } : baseScope;
	}

	return {
		AND: [
			baseScope,
			...(countryScope ? [countryScope] : []),
			{
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
					{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
					{ contact: { phone: { number: { contains: search, mode: 'insensitive' } } } },
					...(localPartnerId ? [] : [{ localPartner: { name: { contains: search, mode: 'insensitive' as const } } }]),
				],
			},
		],
	};
};

const buildCountryFilter = (countryCode: CountryCode): Prisma.RecipientWhereInput => ({
	OR: [
		{ contact: { address: { country: countryCode } } },
		{
			AND: [
				{ OR: [{ contact: { address: null } }, { contact: { address: { country: null } } }] },
				{ localPartner: { contact: { address: { country: countryCode } } } },
			],
		},
	],
});

const buildCandidateWhere = (
	focuses?: string[],
	profiles?: Profile[],
	countryCode?: CountryCode | null,
): Prisma.RecipientWhereInput => {
	const andFilters: Prisma.RecipientWhereInput[] = [];
	if (countryCode) {
		andFilters.push(buildCountryFilter(countryCode));
	}
	if (focuses?.length) {
		andFilters.push(
			...focuses.map((focusId) => ({
				localPartner: { focuses: { some: { focusId } } },
			})),
		);
	}
	if (profiles?.length) {
		const contactFilters: Prisma.ContactWhereInput[] = [];
		if (profiles.includes(Profile.male)) {
			contactFilters.push({ gender: Gender.male });
		}
		if (profiles.includes(Profile.female)) {
			contactFilters.push({ gender: Gender.female });
		}
		if (profiles.includes(Profile.youth)) {
			const currentDate = now();
			contactFilters.push({
				dateOfBirth: {
					gte: new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate()),
				},
			});
		}
		if (contactFilters.length) {
			andFilters.push({ contact: { AND: contactFilters } });
		}
	}

	return {
		programId: null,
		...(andFilters.length ? { AND: andFilters } : {}),
	};
};

const buildCandidateCreateData = (input: CandidateCreateInput, localPartnerId: string): Prisma.RecipientCreateInput => {
	const paymentInformation = buildPaymentInformationCreateData(input);

	return {
		startDate: null,
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		localPartner: { connect: { id: localPartnerId } },
		contact: { create: buildContactCreateData(input) },
		paymentInformation: paymentInformation ? { create: paymentInformation } : undefined,
	};
};

const buildPaymentInformationCreateData = (
	input: CandidateCreateInput,
): Prisma.PaymentInformationCreateWithoutRecipientsInput | undefined => {
	const { mobileMoneyProviderId, code, phone } = input.paymentInformation;
	if (!mobileMoneyProviderId && !code && !phone) {
		return undefined;
	}

	return {
		mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : undefined,
		code: code ?? null,
		phone: phone ? { create: { number: phone } } : undefined,
	};
};

const buildContactCreateData = (input: CandidateCreateInput): Prisma.ContactCreateWithoutRecipientInput => ({
	firstName: input.contact.firstName,
	lastName: input.contact.lastName,
	callingName: input.contact.callingName,
	email: input.contact.email,
	gender: input.contact.gender,
	language: input.contact.language,
	dateOfBirth: input.contact.dateOfBirth,
	profession: input.contact.profession,
	phone: input.contact.phone
		? { create: { number: input.contact.phone, hasWhatsApp: input.contact.hasWhatsApp } }
		: undefined,
	address: getAddressInput(input) ? { create: getAddressInput(input) } : undefined,
});

const buildCandidateUpdateData = (
	input: CandidateUpdateInput,
	context: CandidateUpdatePersistenceContext,
): Prisma.RecipientUpdateInput => {
	const addressInput = getAddressInput(input);
	const paymentPhone = buildPaymentPhoneWriteOperation(
		input.paymentInformation.phone,
		context.paymentPhoneId,
		context.paymentPhoneNumber,
	);
	const hasPaymentPayload = Boolean(
		input.paymentInformation.mobileMoneyProviderId ?? input.paymentInformation.code ?? input.paymentInformation.phone,
	);
	const paymentInformation: Prisma.PaymentInformationUpdateOneWithoutRecipientsNestedInput | undefined =
		context.paymentInformationId
			? {
					upsert: {
						where: { id: context.paymentInformationId },
						create: buildPaymentInformationCreateData(input) ?? {},
						update: {
							mobileMoneyProvider: input.paymentInformation.mobileMoneyProviderId
								? { connect: { id: input.paymentInformation.mobileMoneyProviderId } }
								: { disconnect: true },
							code: input.paymentInformation.code ?? null,
							phone: paymentPhone,
						},
					},
				}
			: hasPaymentPayload
				? { create: buildPaymentInformationCreateData(input) ?? {} }
				: undefined;

	return {
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		...(input.localPartnerId ? { localPartner: { connect: { id: input.localPartnerId } } } : {}),
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
					phone: buildContactPhoneWriteOperation(input, context.contactPhoneId, context.contactPhoneNumber),
					address: buildAddressWriteOperation(addressInput, context.contactAddressId),
				},
			},
		},
		...(paymentInformation ? { paymentInformation } : {}),
	};
};

const buildContactPhoneWriteOperation = (
	input: CandidateUpdateInput,
	currentPhoneId: string | undefined,
	currentPhoneNumber: string | undefined,
): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined => {
	const nextPhone = input.contact.phone;
	if (nextPhone) {
		if (currentPhoneId && currentPhoneNumber === nextPhone) {
			return {
				update: {
					where: { id: currentPhoneId },
					data: { hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}
		if (currentPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhone },
					create: { number: nextPhone, hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}

		return { create: { number: nextPhone, hasWhatsApp: input.contact.hasWhatsApp } };
	}

	return currentPhoneId ? { disconnect: true } : undefined;
};

const buildPaymentPhoneWriteOperation = (
	nextPhone: string | undefined,
	currentPhoneId: string | undefined,
	currentPhoneNumber: string | undefined,
): Prisma.PhoneUpdateOneWithoutPaymentInformationsNestedInput | undefined => {
	if (nextPhone) {
		if (currentPhoneId && currentPhoneNumber === nextPhone) {
			return undefined;
		}
		if (currentPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhone },
					create: { number: nextPhone },
				},
			};
		}

		return { create: { number: nextPhone } };
	}

	return currentPhoneId ? { disconnect: true } : undefined;
};

const buildAddressWriteOperation = (
	addressInput: Prisma.AddressCreateWithoutContactsInput | undefined,
	currentAddressId: string | undefined,
): Prisma.AddressUpdateOneWithoutContactsNestedInput | undefined => {
	if (addressInput) {
		return currentAddressId
			? {
					upsert: {
						where: { id: currentAddressId },
						update: addressInput,
						create: addressInput,
					},
				}
			: { create: addressInput };
	}

	return currentAddressId ? { disconnect: true } : undefined;
};

const getAddressInput = (
	input: CandidateCreateInput | CandidateUpdateInput,
): Prisma.AddressCreateWithoutContactsInput | undefined => {
	const { contact } = input;
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
