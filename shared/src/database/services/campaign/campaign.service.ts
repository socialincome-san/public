import { Campaign as PrismaCampaign } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CampaignTableView, CampaignTableViewRow, CreateCampaignInput, ProgramPermission } from './campaign.types';

export class CampaignService extends BaseService {
	async create(input: CreateCampaignInput): Promise<ServiceResult<PrismaCampaign>> {
		try {
			const campaign = await this.db.campaign.create({ data: input });
			return this.resultOk(campaign);
		} catch (error) {
			console.error('[CampaignService.create]', error);
			return this.resultFail('Could not create campaign');
		}
	}

	async getCampaignTableView(userId: string): Promise<ServiceResult<CampaignTableView>> {
		try {
			const campaigns = await this.db.campaign.findMany({
				where: { program: this.userAccessibleProgramsWhere(userId) },
				select: {
					id: true,
					title: true,
					creatorName: true,
					creatorEmail: true,
					isActive: true,
					goal: true,
					currency: true,
					endDate: true,
					program: {
						select: {
							id: true,
							name: true,
							operatorOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
							viewerOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
						},
					},
				},
				orderBy: { endDate: 'desc' },
			});

			const swissGermanDateFormatter = new Intl.DateTimeFormat('de-CH');

			const tableRows: CampaignTableViewRow[] = campaigns.map((c) => {
				const canOperateOnProgram = (c.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = canOperateOnProgram ? 'operator' : 'viewer';

				return {
					id: c.id,
					title: c.title,
					creatorName: c.creatorName ?? '',
					creatorEmail: c.creatorEmail ?? '',
					status: c.isActive,
					goal: c.goal ?? null,
					currency: c.currency ?? null,
					endDate: c.endDate,
					endDateFormatted: swissGermanDateFormatter.format(c.endDate),
					programName: c.program?.name ?? '',
					programId: c.program?.id ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[CampaignService.getCampaignTableView]', error);
			return this.resultFail('Could not fetch campaigns');
		}
	}

	async getCampaignTableViewProgramScoped(
		userId: string,
		programId: string,
	): Promise<ServiceResult<CampaignTableView>> {
		const base = await this.getCampaignTableView(userId);
		if (!base.success) return base;

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
	}

	private userAccessibleProgramsWhere(userId: string) {
		return {
			OR: [
				{ viewerOrganization: { users: { some: { id: userId } } } },
				{ operatorOrganization: { users: { some: { id: userId } } } },
			],
		};
	}
}
