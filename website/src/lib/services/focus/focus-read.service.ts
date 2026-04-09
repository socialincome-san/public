import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	FocusOption,
	FocusPaginatedTableView,
	FocusPayload,
	FocusTableQuery,
	FocusTableViewRow,
	PublicFocusStats,
	PublicFocusStatsMap,
} from './focus.types';

export class FocusReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildFocusOrderBy(query: FocusTableQuery): Prisma.FocusOrderByWithRelationInput[] {
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
	}

	private async assertAdmin(userId: string): Promise<ServiceResult<true>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}
		if (!isAdminResult.data) {
			return this.resultFail('Permission denied');
		}

		return this.resultOk(true);
	}

	async get(userId: string, id: string): Promise<ServiceResult<FocusPayload>> {
		try {
			const adminResult = await this.assertAdmin(userId);
			if (!adminResult.success) {
				return this.resultFail(adminResult.error);
			}

			const focus = await this.db.focus.findUnique({
				where: { id },
			});
			if (!focus) {
				return this.resultFail('Could not get focus');
			}

			return this.resultOk({
				id: focus.id,
				name: focus.name,
				createdAt: focus.createdAt,
				updatedAt: focus.updatedAt,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get focus: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(userId: string, query: FocusTableQuery): Promise<ServiceResult<FocusPaginatedTableView>> {
		try {
			const adminResult = await this.assertAdmin(userId);
			if (!adminResult.success) {
				return this.resultFail(adminResult.error);
			}

			const search = query.search.trim();
			const where = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							{ name: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: undefined;
			const [focuses, totalCount] = await Promise.all([
				this.db.focus.findMany({
					where,
					orderBy: this.buildFocusOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.focus.count({ where }),
			]);

			const tableRows: FocusTableViewRow[] = focuses.map((focus) => ({
				id: focus.id,
				name: focus.name,
				createdAt: focus.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch focuses: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(): Promise<ServiceResult<FocusOption[]>> {
		try {
			const focuses = await this.db.focus.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(focuses);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch focus options: ${JSON.stringify(error)}`);
		}
	}

	async getPublicFocusStatsById(focusId: string): Promise<ServiceResult<PublicFocusStats>> {
		try {
			const normalizedFocusId = focusId.trim();
			if (!normalizedFocusId) {
				return this.resultFail('Missing focus id');
			}

			const statsMapResult = await this.getPublicFocusStatsByIds([normalizedFocusId]);
			if (!statsMapResult.success) {
				return this.resultFail(statsMapResult.error);
			}

			const stats = statsMapResult.data[normalizedFocusId];
			if (!stats) {
				return this.resultFail('Focus not found');
			}

			return this.resultOk(stats);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch focus stats: ${JSON.stringify(error)}`);
		}
	}

	async getPublicFocusStatsByIds(focusIds: string[]): Promise<ServiceResult<PublicFocusStatsMap>> {
		try {
			const normalizedFocusIds = [...new Set(focusIds.map((focusId) => focusId.trim()).filter(Boolean))];
			if (!normalizedFocusIds.length) {
				return this.resultOk({});
			}

			const focuses = await this.db.focus.findMany({
				where: { id: { in: normalizedFocusIds } },
				select: {
					id: true,
					_count: {
						select: {
							programs: true,
						},
					},
					// Note: `programs`/`localPartners` are relation tables (ProgramTargetFocus / LocalPartnerFocus).
					programs: { select: { programId: true } },
					localPartners: { select: { localPartnerId: true } },
				},
			});

			const statsById: PublicFocusStatsMap = {};

			for (const focus of focuses) {
				const programIds = focus.programs.map((p) => p.programId);
				const localPartnerIds = focus.localPartners.map((lp) => lp.localPartnerId);
				const hasLocalPartners = localPartnerIds.length > 0;

				const recipientsInProgramsCount =
					hasLocalPartners && programIds.length > 0
						? await this.db.recipient.count({
								where: {
									programId: { in: programIds },
									localPartnerId: { in: localPartnerIds },
								},
							})
						: 0;

				const candidatesCount = hasLocalPartners
					? await this.db.recipient.count({
							where: {
								programId: null,
								localPartnerId: { in: localPartnerIds },
							},
						})
					: 0;

				statsById[focus.id] = {
					programsCount: focus._count.programs,
					recipientsInProgramsCount,
					candidatesCount,
				};
			}

			return this.resultOk(statsById);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch focus stats map: ${JSON.stringify(error)}`);
		}
	}
}
