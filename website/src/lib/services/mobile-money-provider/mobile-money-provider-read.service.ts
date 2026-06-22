import { PayoutProcess, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import type { PayoutProcessOverviewOption } from '../payout-process/payout-process-overview.types';
import { UserReadService } from '../user/user-read.service';
import {
	MobileMoneyProviderOption,
	MobileMoneyProviderPaginatedTableView,
	MobileMoneyProviderPayload,
	MobileMoneyProviderTableQuery,
	MobileMoneyProviderTableViewRow,
} from './mobile-money-provider.types';
import { formatPayoutProcessLabel } from './payout-process-options';

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
				payoutProcess: provider.payoutProcess,
				parentId: provider.parentId,
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
					select: {
						id: true,
						name: true,
						payoutProcess: true,
						createdAt: true,
						parent: {
							select: { name: true },
						},
					},
					orderBy: this.buildMobileMoneyProviderOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.mobileMoneyProvider.count({ where }),
			]);
			const tableRows: MobileMoneyProviderTableViewRow[] = providers.map((p) => ({
				id: p.id,
				name: p.name,
				parentName: p.parent?.name ?? null,
				payoutProcess: p.payoutProcess,
				payoutProcessLabel: formatPayoutProcessLabel(p.payoutProcess),
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

	async getRootOptions(userId: string): Promise<ServiceResult<MobileMoneyProviderOption[]>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const providers = await this.db.mobileMoneyProvider.findMany({
				where: { parentId: null },
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(providers);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch root mobile money provider options: ${JSON.stringify(error)}`);
		}
	}

	async getSupportedOptions(): Promise<ServiceResult<MobileMoneyProviderOption[]>> {
		try {
			const providers = await this.db.mobileMoneyProvider.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(providers);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch supported mobile money providers: ${JSON.stringify(error)}`);
		}
	}

	async getPayoutProcessOverviewOptions(): Promise<ServiceResult<PayoutProcessOverviewOption[]>> {
		try {
			const providers = await this.db.mobileMoneyProvider.findMany({
				where: { payoutProcess: { not: null } },
				select: { id: true, name: true, payoutProcess: true },
				orderBy: { name: 'asc' },
			});

			const options: PayoutProcessOverviewOption[] = [];
			const telecelCsvProviderNames: string[] = [];

			for (const provider of providers) {
				if (provider.payoutProcess === PayoutProcess.telecel_csv) {
					telecelCsvProviderNames.push(provider.name);
					continue;
				}

				options.push({
					kind: 'mobile_money_provider',
					id: provider.id,
					name: provider.name,
					payoutProcess: provider.payoutProcess!,
				});
			}

			if (telecelCsvProviderNames.length > 0) {
				options.push({
					kind: 'telecel_csv',
					id: 'telecel_csv',
					name: formatPayoutProcessLabel(PayoutProcess.telecel_csv) ?? 'Telecel CSV upload',
					payoutProcess: PayoutProcess.telecel_csv,
					providerNames: telecelCsvProviderNames,
				});
			}

			return this.resultOk(options);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch payout process overview options: ${JSON.stringify(error)}`);
		}
	}
}
