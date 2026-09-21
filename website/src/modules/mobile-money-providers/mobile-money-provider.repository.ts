import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { MobileMoneyProviderCreateInput, MobileMoneyProviderUpdateInput } from './mobile-money-provider.schemas';
import type { MobileMoneyProviderTableQuery } from './mobile-money-provider.types';

export const findMobileMoneyProviderById = async (providerId: string) =>
	prisma.mobileMoneyProvider.findUnique({
		where: { id: providerId },
		select: mobileMoneyProviderPayloadSelect,
	});

export const findPaginatedMobileMoneyProviders = async (query: MobileMoneyProviderTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.MobileMoneyProviderWhereInput | undefined = search
		? {
				OR: [{ id: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }],
			}
		: undefined;

	const [providers, totalCount] = await Promise.all([
		prisma.mobileMoneyProvider.findMany({
			where,
			select: {
				id: true,
				name: true,
				payoutProcess: true,
				createdAt: true,
				parent: {
					select: { name: true },
				},
			},
			orderBy: buildMobileMoneyProviderOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.mobileMoneyProvider.count({ where }),
	]);

	return { providers, totalCount };
};

export const findMobileMoneyProviderOptions = async ({
	rootOnly = false,
}: {
	rootOnly?: boolean;
} = {}) =>
	prisma.mobileMoneyProvider.findMany({
		where: rootOnly ? { parentId: null } : undefined,
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const findMobileMoneyProvidersWithPayoutProcess = async () =>
	prisma.mobileMoneyProvider.findMany({
		where: { payoutProcess: { not: null } },
		select: { id: true, name: true, payoutProcess: true },
		orderBy: { name: 'asc' },
	});

export const findMobileMoneyProviderByName = async (name: string) =>
	prisma.mobileMoneyProvider.findUnique({
		where: { name },
		select: { id: true },
	});

export const findMobileMoneyProviderParent = async (parentId: string) =>
	prisma.mobileMoneyProvider.findUnique({
		where: { id: parentId },
		select: { id: true },
	});

export const findMobileMoneyProviderForDeletion = async (providerId: string) =>
	prisma.mobileMoneyProvider.findUnique({
		where: { id: providerId },
		select: {
			id: true,
			_count: {
				select: {
					countries: true,
					paymentInformations: true,
				},
			},
		},
	});

export const createMobileMoneyProvider = async (input: MobileMoneyProviderCreateInput) =>
	prisma.mobileMoneyProvider.create({
		data: {
			name: input.name,
			payoutProcess: input.payoutProcess ?? null,
			parentId: input.parentId ?? null,
		},
		select: mobileMoneyProviderPayloadSelect,
	});

export const updateMobileMoneyProvider = async (input: MobileMoneyProviderUpdateInput) =>
	prisma.mobileMoneyProvider.update({
		where: { id: input.id },
		data: {
			name: input.name,
			payoutProcess: input.payoutProcess ?? null,
			parentId: input.parentId ?? null,
		},
		select: mobileMoneyProviderPayloadSelect,
	});

export const deleteMobileMoneyProvider = async (providerId: string) =>
	prisma.mobileMoneyProvider.delete({
		where: { id: providerId },
		select: { id: true },
	});

const mobileMoneyProviderPayloadSelect = {
	id: true,
	name: true,
	payoutProcess: true,
	parentId: true,
	createdAt: true,
	updatedAt: true,
} as const;

const buildMobileMoneyProviderOrderBy = (
	query: MobileMoneyProviderTableQuery,
): Prisma.MobileMoneyProviderOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'name', 'parentName', 'payoutProcess', 'createdAt'] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'name':
			return [{ name: direction }];
		case 'parentName':
			return [{ parent: { name: direction } }];
		case 'payoutProcess':
			return [{ payoutProcess: direction }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ name: 'asc' }];
	}
};
