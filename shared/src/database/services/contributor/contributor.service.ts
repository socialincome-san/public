import { Contributor as PrismaContributor } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateContributorInput } from './contributor.types';

export class ContributorService extends BaseService {
	async create(input: CreateContributorInput): Promise<ServiceResult<PrismaContributor>> {
		try {
			const contributor = await this.db.contributor.create({
				data: input,
			});

			return this.resultOk(contributor);
		} catch (e) {
			console.error('[ContributorService.create]', e);
			return this.resultFail('Could not create contributor');
		}
	}

	async exists(userId: string): Promise<boolean> {
		try {
			const existing = await this.db.contributor.findUnique({
				where: { userId },
				select: { id: true },
			});
			return !!existing;
		} catch (e) {
			console.error('[ContributorService.exists]', e);
			return false;
		}
	}

	async getByUserId(userId: string): Promise<PrismaContributor | null> {
		try {
			return await this.db.contributor.findUnique({ where: { userId } });
		} catch (e) {
			console.error('[ContributorService.getByUserId]', e);
			return null;
		}
	}
}
