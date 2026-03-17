import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	MobileMoneyProviderOption,
	MobileMoneyProviderPaginatedTableView,
	MobileMoneyProviderPayload,
	MobileMoneyProviderTableQuery,
	MobileMoneyProviderTableViewRow,
} from './mobile-money-provider.types';

export class MobileMoneyProviderReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildMobileMoneyProviderOrderBy(
		query: MobileMoneyProviderTableQuery,
	): Prisma.MobileMoneyProviderOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'name', 'isSupported', 'createdAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'name':
				return [{ name: direction }];
			case 'isSupported':
				return [{ isSupported: direction }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ name: 'asc' }];
		}
	}

	async get(userId: string, providerId: string): Promise<ServiceResult<MobileMoneyProviderPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const provider = await this.db.mobileMoneyProvider.findUnique({
				where: { id: providerId },
			});
			if (!provider) {
				return this.resultFail('Could not get mobile money provider');
			}

			return this.resultOk({
				id: provider.id,
				name: provider.name,
				isSupported: provider.isSupported,
				createdAt: provider.createdAt,
				updatedAt: provider.updatedAt,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get mobile money provider: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: MobileMoneyProviderTableQuery,
	): Promise<ServiceResult<MobileMoneyProviderPaginatedTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const search = query.search.trim();
			const where = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							{
								name: {
									contains: search,
									mode: 'insensitive' as const,
								},
							},
						],
					}
				: undefined;
			const [providers, totalCount] = await Promise.all([
				this.db.mobileMoneyProvider.findMany({
					where,
					orderBy: this.buildMobileMoneyProviderOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.mobileMoneyProvider.count({ where }),
			]);
			const tableRows: MobileMoneyProviderTableViewRow[] = providers.map((p) => ({
				id: p.id,
				name: p.name,
				isSupported: p.isSupported,
				createdAt: p.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch mobile money providers: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<MobileMoneyProviderOption[]>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const providers = await this.db.mobileMoneyProvider.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(providers);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch mobile money provider options: ${JSON.stringify(error)}`);
		}
	}

	async getSupportedOptions(): Promise<ServiceResult<MobileMoneyProviderOption[]>> {
		try {
			const providers = await this.db.mobileMoneyProvider.findMany({
				where: { isSupported: true },
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(providers);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch supported mobile money providers: ${JSON.stringify(error)}`);
		}
	}
}
