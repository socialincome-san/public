import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserReadService } from './user-read.service';
import { UserCreateInput, UserPayload, UserUpdateInput } from './user.types';

export class UserWriteService extends BaseService {
	private firebaseAdminService = new FirebaseAdminService();
	private userReadService = new UserReadService();

	async create(actorUserId: string, input: UserCreateInput): Promise<ServiceResult<UserPayload>> {
		const isAdminResult = await this.userReadService.isAdmin(actorUserId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const firebaseResult = await this.firebaseAdminService.getOrCreateUser({
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
		const isAdminResult = await this.userReadService.isAdmin(actorUserId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		if (!input.id) {
			return this.resultFail('User ID is required');
		}
		if (!input.email) {
			return this.resultFail('User email is required');
		}
		if (!input.role) {
			return this.resultFail('User role is required');
		}
		if (!input.organizationId) {
			return this.resultFail('Organization ID is required');
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
				const firebaseUpdateResult = await this.firebaseAdminService.updateByUid(
					existingUser.account.firebaseAuthUserId,
					{
						email: input.email,
						emailVerified: true,
					},
				);

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

	async updateSelf(userId: string, input: UserUpdateInput): Promise<ServiceResult<UserPayload>> {
		try {
			const existingUser = await this.db.user.findUnique({
				where: { id: userId },
				include: {
					contact: { include: { address: true } },
					activeOrganization: true,
					organizationAccesses: { select: { organizationId: true } },
				},
			});

			if (!existingUser) {
				return this.resultFail('User not found');
			}

			if (input.email && input.email !== existingUser.contact.email) {
				return this.resultFail('You cannot change your email yourself.');
			}

			const allowedOrgIds = existingUser.organizationAccesses.map((o) => o.organizationId);

			const updatedUser = await this.db.user.update({
				where: { id: userId },
				data: {
					activeOrganization:
						input.organizationId && allowedOrgIds.includes(input.organizationId)
							? { connect: { id: input.organizationId } }
							: undefined,
					contact: {
						update: {
							firstName: input.firstName ?? existingUser.contact.firstName,
							lastName: input.lastName ?? existingUser.contact.lastName,
							gender: input.gender ?? existingUser.contact.gender,
							language: input.language ?? existingUser.contact.language,
							address: input.address
								? {
										upsert: {
											update: {
												street: input.address.street,
												number: input.address.number,
												city: input.address.city,
												zip: input.address.zip,
												country: input.address.country,
											},
											create: {
												street: input.address.street,
												number: input.address.number,
												city: input.address.city,
												zip: input.address.zip,
												country: input.address.country,
											},
										},
									}
								: undefined,
						},
					},
				},
				include: {
					contact: { include: { address: true } },
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
}
