import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
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
	const where: Prisma.LocalPartnerWhereInput = {
		...(query.focusId ? { focuses: { some: { focusId: query.focusId } } } : {}),
		...(search
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
			: {}),
	};

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

export const findLocalPartnerFilterOption = async (localPartnerId: string, programIds: string[]) =>
	prisma.localPartner.findFirst({
		where: { id: localPartnerId, recipients: { some: { programId: { in: programIds } } } },
		select: { id: true, name: true },
	});

export const findLocalPartnerMessagingTargets = async (localPartnerIds: string[]) =>
	prisma.localPartner.findMany({
		where: { id: { in: localPartnerIds } },
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
		},
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

export const localPartnerPayloadSelect = {
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
