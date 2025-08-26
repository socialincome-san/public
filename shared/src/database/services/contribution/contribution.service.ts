import { Contribution as PrismaContribution } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	ContributionTableView,
	ContributionTableViewRow,
	CreateContributionInput,
	ProgramPermission,
} from './contribution.types';

export class ContributionService extends BaseService {
	async create(input: CreateContributionInput): Promise<ServiceResult<PrismaContribution>> {
		try {
			const contribution = await this.db.contribution.create({
				data: input,
			});

			return this.resultOk(contribution);
		} catch (e) {
			console.error('[ContributionService.create]', e);
			return this.resultFail('Could not create contribution');
		}
	}

	async getContributionTableView(userId: string): Promise<ServiceResult<ContributionTableView>> {
		try {
			const contributions = await this.db.contribution.findMany({
				where: {
					program: this.userAccessibleProgramsWhere(userId),
				},
				select: {
					id: true,
					source: true,
					createdAt: true,
					amount: true,
					currency: true,
					status: true,
					contributionInterval: true,
					campaign: { select: { title: true } },
					program: {
						select: {
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
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: ContributionTableViewRow[] = contributions.map((contribution) => {
				const canOperateOnProgram = (contribution.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = canOperateOnProgram ? 'operator' : 'viewer';

				return {
					id: contribution.id,
					source: contribution.source,
					createdAt: contribution.createdAt,
					createdAtFormatted: new Intl.DateTimeFormat('de-CH').format(contribution.createdAt),
					amount: contribution.amount,
					currency: contribution.currency,
					status: contribution.status,
					campaignName: contribution.campaign?.title ?? '',
					programName: contribution.program?.name ?? '',
					contributionInterval: contribution.contributionInterval,
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[ContributionService.getContributionTableView]', error);
			return this.resultFail('Could not fetch contributions');
		}
	}
}
