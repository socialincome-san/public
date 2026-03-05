import { DonationCertificate, Prisma } from '@/generated/prisma/client';
import { LanguageCode } from '@/lib/types/language';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	DonationCertificatePaginatedTableView,
	DonationCertificateTableQuery,
	DonationCertificateTableViewRow,
	YourDonationCertificatePaginatedTableView,
	YourDonationCertificateTableQuery,
	YourDonationCertificateTableViewRow,
} from './donation-certificate.types';

export class DonationCertificateReadService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	private buildDonationCertificateOrderBy(
		query: DonationCertificateTableQuery,
	): Prisma.DonationCertificateOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'year', 'contributor', 'email', 'storagePath', 'createdAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'year':
				return [{ year: direction }];
			case 'contributor':
				return [
					{ contributor: { contact: { firstName: direction } } },
					{ contributor: { contact: { lastName: direction } } },
				];
			case 'email':
				return [{ contributor: { contact: { email: direction } } }];
			case 'storagePath':
				return [{ storagePath: direction }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private buildYourDonationCertificateOrderBy(
		query: YourDonationCertificateTableQuery,
	): Prisma.DonationCertificateOrderByWithRelationInput[] {
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
	}

	async getPaginatedTableView(
		userId: string,
		query: DonationCertificateTableQuery,
	): Promise<ServiceResult<DonationCertificatePaginatedTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;
			const search = query.search.trim();
			const parsedYear = Number(search);
			const hasYearFilter = search.length > 0 && Number.isInteger(parsedYear);
			const where = {
				contributor: {
					contributions: {
						some: {
							campaign: { organizationId },
						},
					},
				},
				...(search
					? {
							OR: [
								{
									contributor: {
										contact: {
											OR: [
												{ firstName: { contains: search, mode: 'insensitive' as const } },
												{ lastName: { contains: search, mode: 'insensitive' as const } },
												{ email: { contains: search, mode: 'insensitive' as const } },
											],
										},
									},
								},
								{ storagePath: { contains: search, mode: 'insensitive' as const } },
								...(hasYearFilter ? [{ year: parsedYear }] : []),
							],
						}
					: {}),
			};

			const [certificates, totalCount] = await Promise.all([
				this.db.donationCertificate.findMany({
					where,
					select: {
						id: true,
						year: true,
						storagePath: true,
						createdAt: true,
						contributor: {
							select: {
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
					orderBy: this.buildDonationCertificateOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.donationCertificate.count({ where }),
			]);

			const tableRows: DonationCertificateTableViewRow[] = certificates.map((c) => ({
				id: c.id,
				year: c.year,
				contributorFirstName: c.contributor.contact?.firstName ?? '',
				contributorLastName: c.contributor.contact?.lastName ?? '',
				email: c.contributor.contact?.email ?? '',
				storagePath: c.storagePath,
				createdAt: c.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch donation certificates: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedYourCertificatesTableView(
		contributorId: string,
		query: YourDonationCertificateTableQuery,
	): Promise<ServiceResult<YourDonationCertificatePaginatedTableView>> {
		try {
			const search = query.search.trim();
			const parsedYear = Number(search);
			const hasYearFilter = search.length > 0 && Number.isInteger(parsedYear);
			const where = search
				? {
						AND: [
							{ contributorId },
							{
								OR: [
									{ storagePath: { contains: search, mode: 'insensitive' as const } },
									...(hasYearFilter ? [{ year: parsedYear }] : []),
								],
							},
						],
					}
				: { contributorId };

			const [certificates, totalCount] = await Promise.all([
				this.db.donationCertificate.findMany({
					where,
					select: {
						id: true,
						year: true,
						storagePath: true,
						createdAt: true,
						language: true,
					},
					orderBy: this.buildYourDonationCertificateOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.donationCertificate.count({ where }),
			]);

			const tableRows: YourDonationCertificateTableViewRow[] = certificates.map((c) => ({
				id: c.id,
				year: c.year,
				language: c.language,
				createdAt: c.createdAt,
				storagePath: c.storagePath,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch donation certificates: ${JSON.stringify(error)}`);
		}
	}

	async findByYearAndContributor(
		year: number,
		contributorsIds: string[],
	): Promise<ServiceResult<DonationCertificate[]>> {
		try {
			const existingCertificates = await this.db.donationCertificate.findMany({
				where: {
					year: year,
					contributorId: { in: contributorsIds },
				},
			});

			return this.resultOk(existingCertificates);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch existing donation certificates: ${JSON.stringify(error)}`);
		}
	}

	async findByYearAndLanguage(
		year: number,
		contributorsId: string,
		language: LanguageCode,
	): Promise<ServiceResult<DonationCertificate | null>> {
		try {
			const existingCertificate = await this.db.donationCertificate.findFirst({
				where: {
					year: year,
					contributorId: contributorsId,
					language: language,
				},
			});

			return this.resultOk(existingCertificate);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch existing donation certificates: ${JSON.stringify(error)}`);
		}
	}
}
