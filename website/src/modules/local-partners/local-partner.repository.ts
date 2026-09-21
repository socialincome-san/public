import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { LocalPartnerCreateInput, LocalPartnerUpdateInput } from './local-partner.schemas';
import type { LocalPartnerTableQuery } from './local-partner.types';

export const findPublicLocalPartnersByProgramId = async (programId: string) =>
	prisma.localPartner.findMany({
		where: { recipients: { some: { programId } } },
		select: { id: true, name: true, slug: true },
		orderBy: { name: 'asc' },
	});

export const findLocalPartnerIds = async (localPartnerIds: string[]) =>
	prisma.localPartner.findMany({
		where: { id: { in: localPartnerIds } },
		select: { id: true },
	});

export const groupRecipientCountsByLocalPartner = async (localPartnerIds: string[], assigned: boolean) =>
	prisma.recipient.groupBy({
		by: ['localPartnerId'],
		where: {
			localPartnerId: { in: localPartnerIds },
			programId: assigned ? { not: null } : null,
		},
		_count: { _all: true },
	});

export const findLocalPartnersBySlugs = async (slugs: string[]) =>
	prisma.localPartner.findMany({
		where: { slug: { in: slugs } },
		select: { id: true, slug: true },
	});

export const groupProgramRecipientCountsByLocalPartnerSlug = async (slug: string) =>
	prisma.recipient.groupBy({
		by: ['programId'],
		where: {
			localPartner: { slug },
			programId: { not: null },
		},
		_count: { _all: true },
	});

export const findLocalPartnerIdBySlug = async (slug: string) =>
	prisma.localPartner.findUnique({
		where: { slug },
		select: { id: true },
	});

export const countAssignedRecipientsByLocalPartnerId = async (localPartnerId: string) =>
	prisma.recipient.count({
		where: { localPartnerId, programId: { not: null } },
	});

export const countCompletedSurveysByLocalPartnerId = async (localPartnerId: string) =>
	prisma.survey.count({
		where: {
			completedAt: { not: null },
			recipient: { localPartnerId },
		},
	});

export const findLocalPartnerById = async (localPartnerId: string) =>
	prisma.localPartner.findUnique({
		where: { id: localPartnerId },
		select: localPartnerPayloadSelect,
	});

export const findPaginatedLocalPartners = async (query: LocalPartnerTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.LocalPartnerWhereInput | undefined = search
		? {
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ name: { contains: search, mode: 'insensitive' } },
					{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
					{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
					{ contact: { email: { contains: search, mode: 'insensitive' } } },
					{ account: { firebaseAuthUserId: { contains: search, mode: 'insensitive' } } },
					{ contact: { phone: { number: { contains: search, mode: 'insensitive' } } } },
					{ focuses: { some: { focus: { name: { contains: search, mode: 'insensitive' } } } } },
				],
			}
		: undefined;

	const [partners, totalCount] = await Promise.all([
		prisma.localPartner.findMany({
			where,
			select: {
				id: true,
				name: true,
				createdAt: true,
				contact: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
						phone: { select: { number: true } },
						address: { select: { country: true } },
					},
				},
				account: { select: { firebaseAuthUserId: true } },
				focuses: { select: { focus: { select: { name: true } } } },
				_count: { select: { recipients: true } },
			},
			orderBy: buildLocalPartnerOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.localPartner.count({ where }),
	]);

	const assignedRecipientGroups =
		partners.length > 0
			? await groupRecipientCountsByLocalPartner(
					partners.map(({ id }) => id),
					true,
				)
			: [];

	return { partners, totalCount, assignedRecipientGroups };
};

export const findLocalPartnerOptions = async () =>
	prisma.localPartner.findMany({
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const findLocalPartnerSession = async (firebaseAuthUserId: string) =>
	prisma.localPartner.findFirst({
		where: { account: { firebaseAuthUserId } },
		select: {
			id: true,
			name: true,
			focuses: { select: { focusId: true } },
			contact: {
				select: {
					gender: true,
					email: true,
					firstName: true,
					lastName: true,
					language: true,
					address: {
						select: {
							street: true,
							number: true,
							city: true,
							zip: true,
							country: true,
						},
					},
				},
			},
		},
	});

export const findLocalPartnerByName = async (name: string) =>
	prisma.localPartner.findUnique({
		where: { name },
		select: { id: true },
	});

export const findLocalPartnerBySlug = async (slug: string) =>
	prisma.localPartner.findUnique({
		where: { slug },
		select: { id: true },
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

export const findLocalPartnerForUpdate = async (localPartnerId: string) =>
	prisma.localPartner.findUnique({
		where: { id: localPartnerId },
		select: {
			id: true,
			name: true,
			slug: true,
			account: { select: { firebaseAuthUserId: true } },
			contact: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					phone: { select: { id: true, number: true } },
					address: { select: { id: true } },
				},
			},
		},
	});

export const findLocalPartnerForDeletion = async (localPartnerId: string) =>
	prisma.localPartner.findUnique({
		where: { id: localPartnerId },
		select: {
			id: true,
			contactId: true,
			accountId: true,
			account: { select: { firebaseAuthUserId: true } },
			contact: { select: { phoneId: true, addressId: true } },
			_count: { select: { recipients: true } },
		},
	});

export const createLocalPartner = async (input: LocalPartnerCreateInput, firebaseAuthUserId: string) =>
	prisma.localPartner.create({
		data: {
			name: input.name,
			slug: input.slug,
			focuses: { create: input.focuses.map((focusId) => ({ focusId })) },
			account: { create: { firebaseAuthUserId } },
			contact: { create: buildContactCreateData(input) },
		},
		select: localPartnerPayloadSelect,
	});

export const updateLocalPartner = async (
	localPartnerId: string,
	input: LocalPartnerUpdateInput,
	context: {
		contactId: string;
		phoneId: string | undefined;
		phoneNumber: string | undefined;
		addressId: string | undefined;
	},
) =>
	prisma.localPartner.update({
		where: { id: localPartnerId },
		data: {
			name: input.name,
			slug: input.slug,
			focuses: {
				deleteMany: {},
				create: input.focuses.map((focusId) => ({ focusId })),
			},
			contact: {
				update: {
					where: { id: context.contactId },
					data: buildContactUpdateData(input, context),
				},
			},
		},
		select: localPartnerPayloadSelect,
	});

export const deleteLocalPartnerData = async ({
	localPartnerId,
	contactId,
	accountId,
	addressId,
	phoneId,
	deletePhone,
}: {
	localPartnerId: string;
	contactId: string;
	accountId: string;
	addressId: string | null;
	phoneId: string | null;
	deletePhone: boolean;
}) =>
	prisma.$transaction(async (transaction) => {
		await transaction.localPartner.delete({ where: { id: localPartnerId } });
		await transaction.contact.delete({ where: { id: contactId } });
		await transaction.account.delete({ where: { id: accountId } });

		if (addressId) {
			await transaction.address.delete({ where: { id: addressId } });
		}
		if (phoneId && deletePhone) {
			await transaction.phone.delete({ where: { id: phoneId } });
		}
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

export const findShouldDeletePhone = async (phoneId: string) => {
	const phone = await prisma.phone.findUnique({
		where: { id: phoneId },
		select: { _count: { select: { contacts: true, paymentInformations: true } } },
	});

	return Boolean(phone && phone._count.contacts <= 1 && phone._count.paymentInformations === 0);
};

const localPartnerPayloadSelect = {
	id: true,
	name: true,
	slug: true,
	focuses: { select: { focusId: true } },
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
} as const;

const buildLocalPartnerOrderBy = (query: LocalPartnerTableQuery): Prisma.LocalPartnerOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'name',
		'contactPerson',
		'email',
		'firebaseAuthUserId',
		'contactNumber',
		'createdAt',
		'country',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'name':
			return [{ name: direction }];
		case 'contactPerson':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
		case 'email':
			return [{ contact: { email: direction } }];
		case 'firebaseAuthUserId':
			return [{ account: { firebaseAuthUserId: direction } }];
		case 'contactNumber':
			return [{ contact: { phone: { number: direction } } }];
		case 'createdAt':
			return [{ createdAt: direction }];
		case 'country':
			return [{ contact: { address: { country: direction } } }];
		default:
			return [{ name: 'asc' }];
	}
};

const buildContactCreateData = (input: LocalPartnerCreateInput): Prisma.ContactCreateWithoutLocalPartnerInput => ({
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

const buildContactUpdateData = (
	input: LocalPartnerUpdateInput,
	context: {
		phoneId: string | undefined;
		phoneNumber: string | undefined;
		addressId: string | undefined;
	},
): Prisma.ContactUpdateWithoutLocalPartnerInput => {
	const addressInput = getAddressInput(input);

	return {
		firstName: input.contact.firstName,
		lastName: input.contact.lastName,
		callingName: input.contact.callingName,
		email: input.contact.email,
		gender: input.contact.gender,
		language: input.contact.language,
		dateOfBirth: input.contact.dateOfBirth,
		profession: input.contact.profession,
		phone: buildPhoneWriteOperation(input, context.phoneId, context.phoneNumber),
		address: buildAddressWriteOperation(addressInput, context.addressId),
	};
};

const buildPhoneWriteOperation = (
	input: LocalPartnerUpdateInput,
	currentPhoneId: string | undefined,
	currentPhoneNumber: string | undefined,
): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined => {
	if (input.contact.phone) {
		if (currentPhoneId && currentPhoneNumber === input.contact.phone) {
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
					where: { number: input.contact.phone },
					create: { number: input.contact.phone, hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}

		return { create: { number: input.contact.phone, hasWhatsApp: input.contact.hasWhatsApp } };
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
	input: LocalPartnerCreateInput | LocalPartnerUpdateInput,
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
