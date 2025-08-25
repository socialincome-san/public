import { User as PrismaUser } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import { CreateUserInput, UserInformation } from './user.types';

export class UserService extends BaseService {
	async findMany(options?: PaginationOptions): Promise<ServiceResult<PrismaUser[]>> {
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

	async create(input: CreateUserInput): Promise<ServiceResult<PrismaUser>> {
		try {
			const conflict = await this.checkIfUserExists(input.email, input.authUserId);
			if (conflict) {
				return this.resultFail('User with this email or auth ID already exists');
			}

			const user = await this.db.user.create({
				data: input,
			});

			return this.resultOk(user);
		} catch (e) {
			console.error('[UserService.createUser]', e);
			return this.resultFail('Could not create user');
		}
	}

	private async checkIfUserExists(email: string, authUserId: string | null): Promise<PrismaUser | null> {
		const conditions: Array<{ email: string } | { authUserId: string }> = [{ email }];

		if (authUserId?.trim()) {
			conditions.push({ authUserId });
		}

		return this.db.user.findFirst({
			where: {
				OR: conditions,
			},
		});
	}

	async getCurrentUserByAuthId(authUserId: string): Promise<ServiceResult<UserInformation>> {
		try {
			const user = await this.db.user.findUnique({
				where: { authUserId },
				select: {
					firstName: true,
					lastName: true,
					organization: { select: { name: true } },
					role: true,
				},
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			const userInfo: UserInformation = {
				firstName: user.firstName,
				lastName: user.lastName,
				organizationName: user.organization?.name || null,
				role: user.role,
			};

			return this.resultOk(userInfo);
		} catch (e) {
			console.error('[UserService.getCurrentUserByAuthId]', e);
			return this.resultFail('Error fetching user');
		}
	}
}
