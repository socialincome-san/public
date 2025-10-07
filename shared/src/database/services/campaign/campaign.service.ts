import { Campaign, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CampaignTableView, CampaignTableViewRow, CreateCampaignInput } from './campaign.types';

export class CampaignService extends BaseService {
	async create(input: CreateCampaignInput): Promise<ServiceResult<Campaign>> {
		try {
			const campaign = await this.db.campaign.create({ data: input });
			return this.resultOk(campaign);
		} catch {
			return this.resultFail('Could not create campaign');
		}
	}

	async getTableView(userAccountId: string): Promise<ServiceResult<CampaignTableView>> {
		try {
			const campaigns = await this.db.campaign.findMany({
				where: {
					program: {
						accesses: {
							some: { userAccountId },
						},
					},
				},
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
							accesses: {
								where: { userAccountId },
								select: { permissions: true },
							},
						},
					},
				},
				orderBy: { endDate: 'desc' },
			});

			const dateFormatter = new Intl.DateTimeFormat('de-CH');

			const tableRows: CampaignTableViewRow[] = campaigns.map((c) => {
				// each program has at most one access entry for this user
				const permissions = c.program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes('edit') ? 'edit' : 'readonly';

				return {
					id: c.id,
					title: c.title,
					creatorName: c.creatorName ?? '',
					creatorEmail: c.creatorEmail ?? '',
					status: c.isActive,
					goal: c.goal ? Number(c.goal) : null,
					currency: c.currency ?? null,
					endDate: c.endDate,
					endDateFormatted: dateFormatter.format(c.endDate),
					programName: c.program?.name ?? '',
					programId: c.program?.id ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch campaigns');
		}
	}

	async getCampaignTableViewProgramScoped(
		userAccountId: string,
		programId: string,
	): Promise<ServiceResult<CampaignTableView>> {
		const base = await this.getTableView(userAccountId);
		if (!base.success) return base;

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);

		return this.resultOk({ tableRows: filteredRows });
	}
}
