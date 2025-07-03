import { Contribution as PrismaContribution } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateContributionInput } from './contribution.types';

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
}
