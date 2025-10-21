import { ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ContributionTableView, ContributionTableViewRow } from './contribution.types';

export class ContributionService extends BaseService {
	async getContributionTableView(userId: string): Promise<ServiceResult<ContributionTableView>> {
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

		try {
			const contributions = await this.db.contribution.findMany({
				where: {
					campaign: {
						program: {
							accesses: { some: { userId } },
						},
					},
				},
				select: {
					id: true,
					amount: true,
					currency: true,
					status: true,
					createdAt: true,
					contributor: {
						select: {
							contact: {
								select: { firstName: true, lastName: true },
							},
						},
					},
					campaign: {
						select: {
							title: true,
							program: {
								select: {
									id: true,
									name: true,
									accesses: { where: { userId }, select: { permissions: true } },
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const dateFmt = new Intl.DateTimeFormat('de-CH');

			const tableRows: ContributionTableViewRow[] = contributions.map((c) => {
				const program = c.campaign?.program;
				const permissions = program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes('edit')
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				return {
					id: c.id,
					contributorName:
						`${c.contributor?.contact?.firstName ?? ''} ${c.contributor?.contact?.lastName ?? ''}`.trim(),
					amount: Number(c.amount),
					currency: c.currency,
					status: c.status,
					campaignName: c.campaign?.title ?? '',
					programName: program?.name ?? '',
					createdAt: c.createdAt,
					createdAtFormatted: dateFmt.format(c.createdAt),
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch contributions');
		}
	}
}
