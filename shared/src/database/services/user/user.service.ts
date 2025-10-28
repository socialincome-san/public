import { UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserInformation } from './user.types';

export class UserService extends BaseService {
	async getCurrentUserInformation(firebaseAuthUserId: string): Promise<ServiceResult<UserInformation>> {
		try {
			const user = await this.db.user.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					role: true,
					accountId: true,
					contact: { select: { firstName: true, lastName: true } },
					activeOrganization: { select: { id: true, name: true } },
					organizationAccesses: { select: { organization: { select: { id: true, name: true } } } },
					programAccesses: { select: { program: { select: { id: true, name: true } } } },
				},
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			const organizations = user.organizationAccesses.map((access) => ({
				id: access.organization.id,
				name: access.organization.name,
			}));

			const activeOrganization = user.activeOrganization
				? {
						id: user.activeOrganization.id,
						name: user.activeOrganization.name,
					}
				: null;

			const programs = user.programAccesses.map((access) => ({
				id: access.program.id,
				name: access.program.name,
			}));

			const userInfo: UserInformation = {
				id: user.id,
				firstName: user.contact?.firstName ?? null,
				lastName: user.contact?.lastName ?? null,
				role: user.role,
				activeOrganization,
				organizations,
				programs,
			};

			return this.resultOk(userInfo);
		} catch {
			return this.resultFail('Error fetching user information');
		}
	}

	async isAdmin(userId: string): Promise<ServiceResult<true>> {
		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: { role: true },
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			if (user.role !== UserRole.admin) {
				return this.resultFail('Permission denied');
			}

			return this.resultOk(true);
		} catch {
			return this.resultFail('Could not check admin status');
		}
	}
}
