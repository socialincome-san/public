import { UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseService } from '../firebase/firebase.service';
import {
	UserCreateInput,
	UserPayload,
	UserSession,
	UserTableView,
	UserTableViewRow,
	UserUpdateInput,
} from './user.types';

export class UserService extends BaseService {
	private firebaseService = new FirebaseService();

	async create(actorUserId: string, input: UserCreateInput): Promise<ServiceResult<UserPayload>> {
		const isAdminResult = await this.isAdmin(actorUserId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const firebaseResult = await this.firebaseService.getOrCreateUser({
				email: input.email,
				displayName: `${input.firstName} ${input.lastName}`,
			});

			if (!firebaseResult.success) {
				return this.resultFail(firebaseResult.error);
			}

			const firebaseAuthUser = firebaseResult.data;

			const createdUser = await this.db.user.create({
				data: {
					role: input.role,

					activeOrganization: {
						connect: { id: input.organizationId },
					},

					contact: {
						create: {
							firstName: input.firstName,
							lastName: input.lastName,
							email: input.email,
						},
					},

					account: {
						create: {
							firebaseAuthUserId: firebaseAuthUser.uid,
						},
					},

					organizationAccesses: {
						create: {
							organizationId: input.organizationId,
							permission: 'edit',
						},
					},
				},

				include: {
					contact: true,
					activeOrganization: true,
				},
			});

			return this.resultOk({
				id: createdUser.id,
				firstName: createdUser.contact.firstName,
				lastName: createdUser.contact.lastName,
				email: createdUser.contact.email,
				role: createdUser.role,
				organizationId: createdUser.activeOrganization?.id ?? null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create user: ${JSON.stringify(error)}`);
		}
	}

	async update(actorUserId: string, input: UserUpdateInput): Promise<ServiceResult<UserPayload>> {
		const isAdminResult = await this.isAdmin(actorUserId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const existingUser = await this.db.user.findUnique({
				where: { id: input.id },
				include: { contact: true, account: true },
			});

			if (!existingUser) {
				return this.resultFail('User not found');
			}

			if (input.email !== existingUser.contact.email) {
				const firebaseUpdateResult = await this.firebaseService.updateByUid(existingUser.account.firebaseAuthUserId, {
					email: input.email,
					emailVerified: true,
				});

				if (!firebaseUpdateResult.success) {
					return this.resultFail(firebaseUpdateResult.error);
				}
			}

			const updatedUser = await this.db.user.update({
				where: { id: input.id },
				data: {
					role: input.role,

					activeOrganization: {
						connect: { id: input.organizationId },
					},

					contact: {
						update: {
							firstName: input.firstName,
							lastName: input.lastName,
							email: input.email,
						},
					},

					organizationAccesses: {
						deleteMany: { userId: input.id },
						create: {
							organizationId: input.organizationId,
							permission: 'edit',
						},
					},
				},
				include: {
					contact: true,
					activeOrganization: true,
				},
			});

			return this.resultOk({
				id: updatedUser.id,
				firstName: updatedUser.contact.firstName,
				lastName: updatedUser.contact.lastName,
				email: updatedUser.contact.email,
				role: updatedUser.role,
				organizationId: updatedUser.activeOrganization?.id ?? null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update user: ${JSON.stringify(error)}`);
		}
	}

	async get(actorUserId: string, userId: string): Promise<ServiceResult<UserPayload>> {
		const isAdminResult = await this.isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				include: {
					contact: true,
					activeOrganization: true,
				},
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			return this.resultOk({
				id: user.id,
				firstName: user.contact.firstName,
				lastName: user.contact.lastName,
				email: user.contact.email,
				role: user.role,
				organizationId: user.activeOrganization?.id ?? null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch user: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(actorUserId: string): Promise<ServiceResult<{ id: string; name: string }[]>> {
		const isAdminResult = await this.isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const organizations = await this.db.organization.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(organizations);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not load user options: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<UserTableView>> {
		const isAdminResult = await this.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const users = await this.db.user.findMany({
				select: {
					id: true,
					role: true,
					createdAt: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
						},
					},
					activeOrganization: {
						select: {
							name: true,
						},
					},
				},
				orderBy: [{ createdAt: 'desc' }],
			});

			const tableRows: UserTableViewRow[] = users.map((user) => ({
				id: user.id,
				firstName: user.contact?.firstName ?? null,
				lastName: user.contact?.lastName ?? null,
				email: user.contact?.email ?? null,
				role: user.role,
				organizationName: user.activeOrganization?.name ?? null,
				createdAt: user.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch users: ${JSON.stringify(error)}`);
		}
	}

	async getCurrentUserSession(firebaseAuthUserId: string): Promise<ServiceResult<UserSession>> {
		try {
			const user = await this.db.user.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					role: true,
					accountId: true,
					contact: { select: { firstName: true, lastName: true } },
					activeOrganization: {
						select: {
							id: true,
							name: true,
							programAccesses: {
								select: {
									program: { select: { id: true, name: true } },
								},
							},
						},
					},
					organizationAccesses: {
						select: {
							organization: { select: { id: true, name: true } },
						},
					},
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

			const programs = user.activeOrganization
				? Array.from(
						new Map(
							user.activeOrganization.programAccesses.map((a) => [
								a.program.id,
								{ id: a.program.id, name: a.program.name },
							]),
						).values(),
					)
				: [];

			const userInfo: UserSession = {
				type: 'user',
				id: user.id,
				firstName: user.contact?.firstName ?? null,
				lastName: user.contact?.lastName ?? null,
				role: user.role,
				activeOrganization,
				organizations,
				programs,
			};

			return this.resultOk(userInfo);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Error fetching user information: ${JSON.stringify(error)}`);
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
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not check admin status: ${JSON.stringify(error)}`);
		}
	}
}
