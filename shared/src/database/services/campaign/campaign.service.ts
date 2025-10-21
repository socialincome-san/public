import { ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CampaignTableView, CampaignTableViewRow } from './campaign.types';

export class CampaignService extends BaseService {
	async getTableView(userId: string): Promise<ServiceResult<CampaignTableView>> {
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

		try {
			const campaigns = await this.db.campaign.findMany({
				where: {
					program: {
						accesses: {
							some: { userId },
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
								where: { userId },
								select: { permissions: true },
							},
						},
					},
				},
				orderBy: { endDate: 'desc' },
			});

			const dateFormatter = new Intl.DateTimeFormat('de-CH');

			const tableRows: CampaignTableViewRow[] = campaigns.map((c) => {
				const permissions = c.program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly;

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
		userId: string,
		programId: string,
	): Promise<ServiceResult<CampaignTableView>> {
		const base = await this.getTableView(userId);
		if (!base.success) return base;

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
	}
}
