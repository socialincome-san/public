import { User as PrismaUser } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import { CreateUserInput } from './user.types';

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

	async createUsers(inputs: CreateUserInput[]): Promise<ServiceResult<number>> {
		try {
			const result = await this.db.user.createMany({
				data: inputs,
				skipDuplicates: true,
			});
			return this.resultOk(result.count);
		} catch (e) {
			console.error('[UserService.createUsers]', e);
			return this.resultFail('Could not create users');
		}
	}
}
