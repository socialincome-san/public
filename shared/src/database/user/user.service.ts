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

	async createUser(input: CreateUserInput): Promise<ServiceResult<PrismaUser>> {
		try {
			const conflict = await this.checkIfUserExists(input.email, input.authUserId);
			if (conflict) {
				return this.resultFail('User with this email or auth ID already exists');
			}

			const user = await this.db.user.create({
				data: {
					...input,
					role: input.role ?? 'user',
				},
			});

			return this.resultOk(user);
		} catch (e) {
			console.error('[UserService.createUser]', e);
			return this.resultFail('Could not create user');
		}
	}

	private async checkIfUserExists(email: string, authUserId: string): Promise<PrismaUser | null> {
		return await this.db.user.findFirst({
			where: {
				OR: [{ email }, { authUserId }],
			},
		});
	}
}
