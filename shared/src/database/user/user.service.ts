import { User as PrismaUser } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';

export class UserService extends BaseService {
	async getUsers(options?: PaginationOptions): Promise<ServiceResult<PrismaUser[]>> {
		try {
			const users = await this.db.user.findMany({
				orderBy: { createdAt: 'desc' },
				...options,
			});

			return this.resultOk(users);
		} catch (e) {
			console.error('[UserService.getUsers]', e);
			return this.resultFail('Could not fetch users');
		}
	}
}
