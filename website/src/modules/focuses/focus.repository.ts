import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { FocusCreateInput, FocusUpdateInput } from './focus.schemas';
import type { FocusTableQuery } from './focus.types';

const focusPayloadSelect = {
	id: true,
	name: true,
	slug: true,
	createdAt: true,
	updatedAt: true,
} as const;

export const findFocusById = async (focusId: string) =>
	prisma.focus.findUnique({
		where: { id: focusId },
		select: focusPayloadSelect,
	});

export const findPaginatedFocuses = async (query: FocusTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.FocusWhereInput | undefined = search
		? {
				OR: [{ id: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }],
			}
		: undefined;
	const [focuses, totalCount] = await Promise.all([
		prisma.focus.findMany({
			where,
			select: {
				id: true,
				name: true,
				createdAt: true,
			},
			orderBy: buildFocusOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.focus.count({ where }),
	]);

	return { focuses, totalCount };
};

export const findFocusOptions = async () =>
	prisma.focus.findMany({
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const findFocusStatsBySlugs = async (focusSlugs: string[]) =>
	prisma.focus.findMany({
		where: { slug: { in: focusSlugs } },
		select: {
			id: true,
			slug: true,
			_count: {
				select: {
					programs: true,
				},
			},
			programs: {
				select: {
					programId: true,
					program: {
						select: {
							country: {
								select: { isoCode: true },
							},
						},
					},
				},
			},
			localPartners: {
				select: { localPartnerId: true },
			},
		},
	});

export const findFocusByName = async (name: string) =>
	prisma.focus.findUnique({
		where: { name },
		select: { id: true },
	});

export const findFocusBySlug = async (slug: string) =>
	prisma.focus.findUnique({
		where: { slug },
		select: { id: true },
	});

export const createFocus = async (input: FocusCreateInput) =>
	prisma.focus.create({
		data: input,
		select: focusPayloadSelect,
	});

export const updateFocus = async (input: FocusUpdateInput) =>
	prisma.focus.update({
		where: { id: input.id },
		data: {
			name: input.name,
			slug: input.slug,
		},
		select: focusPayloadSelect,
	});

export const findFocusForDeletion = async (focusId: string) =>
	prisma.focus.findUnique({
		where: { id: focusId },
		select: {
			id: true,
			_count: {
				select: {
					localPartners: true,
					programs: true,
				},
			},
		},
	});

export const deleteFocus = async (focusId: string) =>
	prisma.focus.delete({
		where: { id: focusId },
		select: { id: true },
	});

const buildFocusOrderBy = (query: FocusTableQuery): Prisma.FocusOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'name', 'createdAt'] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'name':
			return [{ name: direction }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ name: 'asc' }];
	}
};
