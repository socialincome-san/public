import { User as PrismaUser } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import { CreateUserInput, UserTableView, UserTableViewRow } from './user.types';

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

	async getCurrentUserByAuthId(authUserId: string): Promise<ServiceResult<PrismaUser>> {
		try {
			const user = await this.db.user.findUnique({
				where: { authUserId },
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			return this.resultOk(user);
		} catch (e) {
			console.error('[UserService.getCurrentUserByAuthId]', e);
			return this.resultFail('Error fetching user');
		}
	}

	async getUserTableView(user: PrismaUser): Promise<ServiceResult<UserTableView>> {
		const accessDenied = this.requireGlobalAnalystOrAdmin<UserTableView>(user);
		if (accessDenied) return accessDenied;

		try {
			const users = await this.db.user.findMany({
				select: {
					id: true,
					firstName: true,
					lastName: true,
					role: true,
					organization: { select: { name: true } },
				},
				orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
			});

			const tableRows: UserTableViewRow[] = users.map((user) => ({
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				organizationName: user.organization?.name ?? '',
				readonly: user.role === 'globalAnalyst',
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[UserService.getUserTableView]', error);
			return this.resultFail('Could not fetch users');
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
}
