import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserFormCreateInput, UserFormUpdateInput } from './user-form-input';
import { UserReadService } from './user-read.service';
import { UserValidationService } from './user-validation.service';
import { UserPayload, UserUpdateInput } from './user.types';

export class UserWriteService extends BaseService {
	private getAccessRows(organizationIds: string[]) {
		const uniqueOrganizationIds = Array.from(new Set(organizationIds));

		return uniqueOrganizationIds.map((organizationId) => ({ organizationId }));
	}

	private getPreferredActiveOrganizationId(organizationIds: string[], currentActiveOrganizationId?: string | null) {
		const allowedOrganizationIds = new Set(organizationIds);
		if (currentActiveOrganizationId && allowedOrganizationIds.has(currentActiveOrganizationId)) {
			return currentActiveOrganizationId;
		}

		return organizationIds[0] ?? null;
	}

	constructor(
		db: PrismaClient,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly userReadService: UserReadService,
		private readonly userValidationService: UserValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(actorUserId: string, input: UserFormCreateInput): Promise<ServiceResult<UserPayload>> {
		try {
			const isAdminResult = await this.userReadService.isAdmin(actorUserId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.userValidationService.validateCreateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			const uniquenessResult = await this.userValidationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const displayName = `${validatedInput.firstName} ${validatedInput.lastName}`.trim();
			const existingFirebaseUserResult = await this.firebaseAdminService.getByEmail(validatedInput.email);
			if (!existingFirebaseUserResult.success) {
				return this.resultFail(`Failed to check Firebase user: ${existingFirebaseUserResult.error}`);
			}
			const didCreateFirebaseUser = !existingFirebaseUserResult.data;

			const firebaseResult = await this.firebaseAdminService.getOrCreateUser({
				email: validatedInput.email,
				displayName,
			});

			if (!firebaseResult.success) {
				return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}

			const firebaseAuthUser = firebaseResult.data;
			let createdUser:
				| {
						id: string;
						role: UserPayload['role'];
						contact: {
							firstName: string | null;
							lastName: string | null;
							email: string | null;
						};
						activeOrganization: {
							id: string;
						} | null;
				  }
				| undefined;
			const activeOrganizationId = this.getPreferredActiveOrganizationId(validatedInput.organizationIds);
			if (!activeOrganizationId) {
				return this.resultFail('At least one organization permission is required.');
			}

			try {
				createdUser = await this.db.user.create({
					data: {
						role: validatedInput.role,
						activeOrganization: {
							connect: {
								id: activeOrganizationId,
							},
						},
						contact: {
							create: {
								firstName: validatedInput.firstName,
								lastName: validatedInput.lastName,
								email: validatedInput.email,
							},
						},
						account: {
							create: {
								firebaseAuthUserId: firebaseAuthUser.uid,
							},
						},
						organizationAccesses: {
							createMany: {
								data: this.getAccessRows(validatedInput.organizationIds),
							},
						},
					},
					include: {
						contact: true,
						activeOrganization: true,
					},
				});
			} catch (dbError) {
				if (didCreateFirebaseUser) {
					const rollbackResult = await this.firebaseAdminService.deleteByUidIfExists(firebaseAuthUser.uid);
					if (!rollbackResult.success) {
						this.logger.warn('Could not rollback Firebase user after failed user creation', {
							firebaseUid: firebaseAuthUser.uid,
							error: rollbackResult.error,
						});
					}
				}
				throw dbError;
			}

			if (!createdUser) {
				return this.resultFail('Could not create user. Please try again later.');
			}

			const firebaseSyncResult = await this.firebaseAdminService.updateByUid(firebaseAuthUser.uid, {
				email: validatedInput.email,
				displayName,
				emailVerified: true,
			});
			if (!firebaseSyncResult.success) {
				this.logger.warn('Could not fully sync Firebase Auth user on user creation', {
					firebaseUid: firebaseAuthUser.uid,
					error: firebaseSyncResult.error,
				});
			}

			return this.resultOk({
				id: createdUser.id,
				firstName: createdUser.contact.firstName,
				lastName: createdUser.contact.lastName,
				email: createdUser.contact.email,
				role: createdUser.role,
				organizationId: createdUser.activeOrganization?.id ?? null,
				organizationIds: validatedInput.organizationIds,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create user. Please try again later.');
		}
	}

	async update(actorUserId: string, input: UserFormUpdateInput): Promise<ServiceResult<UserPayload>> {
		try {
			const isAdminResult = await this.userReadService.isAdmin(actorUserId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.userValidationService.validateUpdateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			const existingUser = await this.db.user.findUnique({
				where: { id: validatedInput.id },
				include: { contact: true, account: true },
			});

			if (!existingUser) {
				return this.resultFail('User not found');
			}

			const uniquenessResult = await this.userValidationService.validateUpdateUniqueness(validatedInput, {
				contactId: existingUser.contact.id,
				existingEmail: existingUser.contact.email ?? null,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const newDisplayName = `${validatedInput.firstName} ${validatedInput.lastName}`.trim();
			const oldDisplayName = `${existingUser.contact.firstName} ${existingUser.contact.lastName}`.trim();
			const shouldSyncFirebaseUser =
				validatedInput.email !== existingUser.contact.email || newDisplayName !== oldDisplayName;

			const activeOrganizationId = this.getPreferredActiveOrganizationId(
				validatedInput.organizationIds,
				existingUser.activeOrganizationId,
			);

			const updatedUser = await this.db.user.update({
				where: { id: validatedInput.id },
				data: {
					role: validatedInput.role,
					activeOrganization: activeOrganizationId ? { connect: { id: activeOrganizationId } } : undefined,
					contact: {
						update: {
							firstName: validatedInput.firstName,
							lastName: validatedInput.lastName,
							email: validatedInput.email,
						},
					},
					organizationAccesses: {
						deleteMany: { userId: validatedInput.id },
						createMany: {
							data: this.getAccessRows(validatedInput.organizationIds),
						},
					},
				},
				include: {
					contact: true,
					activeOrganization: true,
				},
			});

			if (shouldSyncFirebaseUser) {
				const firebaseUpdateResult = await this.firebaseAdminService.updateByUid(existingUser.account.firebaseAuthUserId, {
					email: validatedInput.email,
					displayName: newDisplayName,
					emailVerified: true,
				});

				if (!firebaseUpdateResult.success) {
					this.logger.warn('Could not fully sync Firebase Auth user on user update', {
						firebaseUid: existingUser.account.firebaseAuthUserId,
						error: firebaseUpdateResult.error,
					});
				}
			}

			return this.resultOk({
				id: updatedUser.id,
				firstName: updatedUser.contact.firstName,
				lastName: updatedUser.contact.lastName,
				email: updatedUser.contact.email,
				role: updatedUser.role,
				organizationId: updatedUser.activeOrganization?.id ?? null,
				organizationIds: validatedInput.organizationIds,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update user. Please try again later.');
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
					organizationAccesses: {
						select: {
							organizationId: true,
						},
					},
				},
			});

			const organizationIds = updatedUser.organizationAccesses.map((access) => access.organizationId);

			return this.resultOk({
				id: updatedUser.id,
				firstName: updatedUser.contact.firstName,
				lastName: updatedUser.contact.lastName,
				email: updatedUser.contact.email,
				role: updatedUser.role,
				organizationId: updatedUser.activeOrganization?.id ?? null,
				organizationIds,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update user: ${JSON.stringify(error)}`);
		}
	}

	async delete(actorUserId: string, targetUserId: string): Promise<ServiceResult<void>> {
		try {
			const isAdminResult = await this.userReadService.isAdmin(actorUserId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			if (actorUserId === targetUserId) {
				return this.resultFail('You cannot delete your own user account.');
			}

			const existingUser = await this.db.user.findUnique({
				where: { id: targetUserId },
				select: {
					id: true,
					accountId: true,
					contactId: true,
					account: {
						select: {
							firebaseAuthUserId: true,
						},
					},
				},
			});

			if (!existingUser) {
				return this.resultFail('User not found');
			}

			await this.db.$transaction(async (tx) => {
				await tx.organizationAccess.deleteMany({
					where: { userId: targetUserId },
				});
				await tx.user.delete({
					where: { id: targetUserId },
				});
				await tx.contact.delete({
					where: { id: existingUser.contactId },
				});
				await tx.account.delete({
					where: { id: existingUser.accountId },
				});
			});

			const firebaseDeleteResult = await this.firebaseAdminService.deleteByUidIfExists(
				existingUser.account.firebaseAuthUserId,
			);
			if (!firebaseDeleteResult.success) {
				this.logger.warn('User deleted in DB but Firebase user deletion failed', {
					userId: targetUserId,
					firebaseUid: existingUser.account.firebaseAuthUserId,
					error: firebaseDeleteResult.error,
				});
			}

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not delete user. Please try again later.');
		}
	}
}
