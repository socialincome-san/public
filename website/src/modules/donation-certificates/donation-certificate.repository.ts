import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import type { LanguageCode } from '@/lib/types/language';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { DonationCertificateTableQuery, YourDonationCertificateTableQuery } from './donation-certificate.types';

export const findPaginatedDonationCertificates = async (programIds: string[], query: DonationCertificateTableQuery) => {
	const where = buildDonationCertificateWhere(programIds, query.search);
	const [certificates, totalCount] = await Promise.all([
		prisma.donationCertificate.findMany({
			where,
			select: {
				id: true,
				year: true,
				storagePath: true,
				createdAt: true,
				contributor: {
					select: {
						id: true,
						contact: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				},
			},
			orderBy: buildDonationCertificateOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.donationCertificate.count({ where }),
	]);

	return { certificates, totalCount };
};

export const findPaginatedContributorDonationCertificates = async (
	contributorId: string,
	query: YourDonationCertificateTableQuery,
) => {
	const where = buildContributorDonationCertificateWhere(contributorId, query.search);
	const [certificates, totalCount] = await Promise.all([
		prisma.donationCertificate.findMany({
			where,
			select: {
				id: true,
				year: true,
				storagePath: true,
				createdAt: true,
				language: true,
			},
			orderBy: buildContributorDonationCertificateOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.donationCertificate.count({ where }),
	]);

	return { certificates, totalCount };
};

export const findDonationCertificateByYearAndLanguage = async (
	year: number,
	contributorId: string,
	language: LanguageCode,
) =>
	prisma.donationCertificate.findFirst({
		where: {
			year,
			contributorId,
			language,
		},
		select: {
			id: true,
			year: true,
			language: true,
			storagePath: true,
			contributorId: true,
			createdAt: true,
		},
	});

export const createDonationCertificate = async (input: {
	year: number;
	language: LanguageCode;
	storagePath: string;
	contributorId: string;
}) => prisma.donationCertificate.createMany({ data: input });

const buildDonationCertificateWhere = (programIds: string[], searchInput: string): Prisma.DonationCertificateWhereInput => {
	const search = searchInput.trim();
	const parsedYear = Number(search);
	const hasYearFilter = search.length > 0 && Number.isInteger(parsedYear);
	const baseWhere: Prisma.DonationCertificateWhereInput = {
		contributor: {
			contributions: {
				some: {
					campaign: {
						programId: {
							in: programIds,
						},
					},
				},
			},
		},
	};
	if (!search) {
		return baseWhere;
	}

	return {
		AND: [
			baseWhere,
			{
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contributor: { contact: { firstName: { contains: search, mode: 'insensitive' } } } },
					{ contributor: { contact: { lastName: { contains: search, mode: 'insensitive' } } } },
					{ contributor: { contact: { email: { contains: search, mode: 'insensitive' } } } },
					{ storagePath: { contains: search, mode: 'insensitive' } },
					...(hasYearFilter ? [{ year: parsedYear }] : []),
				],
			},
		],
	};
};

const buildContributorDonationCertificateWhere = (
	contributorId: string,
	searchInput: string,
): Prisma.DonationCertificateWhereInput => {
	const search = searchInput.trim();
	const parsedYear = Number(search);
	const hasYearFilter = search.length > 0 && Number.isInteger(parsedYear);
	if (!search) {
		return { contributorId };
	}

	return {
		AND: [
			{ contributorId },
			{
				OR: [{ storagePath: { contains: search, mode: 'insensitive' } }, ...(hasYearFilter ? [{ year: parsedYear }] : [])],
			},
		],
	};
};

const buildDonationCertificateOrderBy = (
	query: DonationCertificateTableQuery,
): Prisma.DonationCertificateOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'year', 'contributor', 'email', 'storagePath', 'createdAt'] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'year':
			return [{ year: direction }];
		case 'contributor':
			return [{ contributor: { contact: { firstName: direction } } }, { contributor: { contact: { lastName: direction } } }];
		case 'email':
			return [{ contributor: { contact: { email: direction } } }];
		case 'storagePath':
			return [{ storagePath: direction }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ createdAt: 'desc' }];
	}
};

const buildContributorDonationCertificateOrderBy = (
	query: YourDonationCertificateTableQuery,
): Prisma.DonationCertificateOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['year', 'language', 'createdAt'] as const);

	switch (sortBy) {
		case 'year':
			return [{ year: direction }];
		case 'language':
			return [{ language: direction }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ createdAt: 'desc' }];
	}
};
