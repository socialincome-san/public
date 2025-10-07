import { User, UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateUserInput, UserInformation, UserTableView, UserTableViewRow } from './user.types';

export class UserService extends BaseService {
	async create(input: CreateUserInput): Promise<ServiceResult<User>> {
		try {
			const user = await this.db.user.create({ data: input });
			return this.resultOk(user);
		} catch (error) {
			return this.resultFail('Could not create user');
		}
	}

	async getCurrentUserInformation(firebaseAuthUserId: string): Promise<ServiceResult<UserInformation>> {
		try {
			const user = await this.db.user.findFirst({
				where: {
					account: {
						firebaseAuthUserId,
					},
				},
				select: {
					id: true,
					role: true,
					accountId: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
					organizationAccesses: {
						select: {
							organization: { select: { name: true } },
						},
					},
				},
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			const userInfo: UserInformation = {
				id: user.id,
				firstName: user.contact?.firstName ?? null,
				lastName: user.contact?.lastName ?? null,
				organizationNames: user.organizationAccesses.map((a) => a.organization.name),
				role: user.role,
			};

			return this.resultOk(userInfo);
		} catch (error) {
			return this.resultFail('Error fetching user information');
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<UserTableView>> {
		try {
			const currentUser = await this.db.user.findUnique({
				where: { id: userId },
				select: { role: true },
			});

			if (!currentUser || currentUser.role !== UserRole.admin) {
				return this.resultOk({ tableRows: [] });
			}

			const users = await this.db.user.findMany({
				select: {
					id: true,
					role: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
					organizationAccesses: {
						select: {
							organization: { select: { name: true } },
						},
					},
				},
				orderBy: [{ role: 'asc' }, { id: 'asc' }],
			});

			const tableRows: UserTableViewRow[] = users.map((u) => ({
				id: u.id,
				firstName: u.contact?.firstName ?? '',
				lastName: u.contact?.lastName ?? '',
				role: u.role,
				organizationName: u.organizationAccesses[0]?.organization.name ?? '',
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			return this.resultFail('Could not fetch users');
		}
	}
}
