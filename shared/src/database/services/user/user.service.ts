import { UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserInformation, UserTableView, UserTableViewRow } from './user.types';

export class UserService extends BaseService {
	async getCurrentUserInformation(firebaseAuthUserId: string): Promise<ServiceResult<UserInformation>> {
		if (!firebaseAuthUserId) {
			return this.resultFail('Firebase Auth User ID is required', 401);
		}

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
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

		if (authResult.data.role !== UserRole.admin) {
			return this.resultOk({ tableRows: [] });
		}

		try {
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
