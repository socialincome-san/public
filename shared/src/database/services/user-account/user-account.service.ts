import { UserAccount } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateUserAccountInput, UserInformation } from './user.types';

export class UserAccountService extends BaseService {
	async create(input: CreateUserAccountInput): Promise<ServiceResult<UserAccount>> {
		try {
			const user = await this.db.userAccount.create({
				data: input,
			});

			return this.resultOk(user);
		} catch (e) {
			return this.resultFail('Could not create user account');
		}
	}

	async getCurrentUserInformation(firebaseAuthUserId: string): Promise<ServiceResult<UserInformation>> {
		console.log('>>>>>>', firebaseAuthUserId);
		try {
			const userInformation = await this.db.userAccount.findUnique({
				where: { firebaseAuthUserId },
				select: {
					id: true,
					role: true,
					contributor: { select: { contact: { select: { firstName: true, lastName: true } } } },
					organizationAccesses: {
						select: {
							organization: { select: { name: true } },
						},
					},
				},
			});

			if (!userInformation) {
				return this.resultFail('User account not found');
			}

			const userInfo: UserInformation = {
				id: userInformation.id,
				firstName: userInformation.contributor?.contact.firstName ?? null,
				lastName: userInformation.contributor?.contact.lastName ?? null,
				organizationNames: userInformation.organizationAccesses.map((access) => access.organization.name),
				role: userInformation.role,
			};

			return this.resultOk(userInfo);
		} catch (e) {
			return this.resultFail('Error fetching user information');
		}
	}

	// async getUserAdminTableView(user: UserInformation): Promise<ServiceResult<UserTableView>> {
	// 	const accessDenied = this.requireGlobalAnalystOrAdmin<UserTableView>(user);
	// 	if (accessDenied) return accessDenied;
	//
	// 	try {
	// 		const users = await this.db.user.findMany({
	// 			select: {
	// 				id: true,
	// 				firstName: true,
	// 				lastName: true,
	// 				role: true,
	// 				organization: { select: { name: true } },
	// 			},
	// 			orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
	// 		});
	//
	// 		const tableRows: UserTableViewRow[] = users.map((user) => ({
	// 			id: user.id,
	// 			firstName: user.firstName,
	// 			lastName: user.lastName,
	// 			role: user.role,
	// 			organizationName: user.organization?.name ?? '',
	// 			readonly: user.role === 'globalAnalyst',
	// 		}));
	//
	// 		return this.resultOk({ tableRows });
	// 	} catch (error) {
	// 		console.error('[UserService.getUserTableView]', error);
	// 		return this.resultFail('Could not fetch users');
	// 	}
	// }
}
