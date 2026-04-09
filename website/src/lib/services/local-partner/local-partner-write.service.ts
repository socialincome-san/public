import { LocalPartner, Prisma, PrismaClient } from '@/generated/prisma/client';
import { Session } from '@/lib/firebase/current-account';
import { logger } from '@/lib/utils/logger';
import { ContactRelationsService } from '../contact/contact-relations.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserReadService } from '../user/user-read.service';
import { LocalPartnerFormCreateInput, LocalPartnerFormUpdateInput } from './local-partner-form-input';
import { LocalPartnerValidationService } from './local-partner-validation.service';

export class LocalPartnerWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly localPartnerValidationService: LocalPartnerValidationService,
		private readonly contactRelationsService: ContactRelationsService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(userId: string, input: LocalPartnerFormCreateInput): Promise<ServiceResult<LocalPartner>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		const validatedInputResult = this.localPartnerValidationService.validateCreateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const uniquenessResult = await this.localPartnerValidationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const displayName = `${validatedInput.contact.firstName} ${validatedInput.contact.lastName}`.trim();

			const firebaseResult = await this.firebaseAdminService.getOrCreateUser({
				email: validatedInput.contact.email,
				displayName,
			});

			if (!firebaseResult.success) {
				return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}
			const firebaseSyncResult = await this.firebaseAdminService.updateByUid(firebaseResult.data.uid, {
				email: validatedInput.contact.email,
				displayName,
			});
			if (!firebaseSyncResult.success) {
				this.logger.warn('Could not fully sync Firebase Auth user on local partner creation', {
					firebaseUid: firebaseResult.data.uid,
					error: firebaseSyncResult.error,
				});
			}

			const partner = await this.db.localPartner.create({
				data: {
					name: validatedInput.name,
					focuses: {
						create: validatedInput.focuses.map((focusId) => ({ focusId })),
					},
					account: {
						create: {
							firebaseAuthUserId: firebaseResult.data.uid,
						},
					},
					contact: {
						create: this.buildContactCreateData(validatedInput),
					},
				},
			});

			return this.resultOk(partner);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create local partner. Please try again later.');
		}
	}

	async update(session: Session, input: LocalPartnerFormUpdateInput): Promise<ServiceResult<LocalPartner>> {
		const validatedInputResult = this.localPartnerValidationService.validateUpdateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const partnerId = session.type === 'local-partner' ? session.id : validatedInput.id;
			if (!partnerId) {
				return this.resultFail('Invalid local partner reference.');
			}

			const existing = await this.db.localPartner.findUnique({
				where: { id: partnerId },
				select: {
					id: true,
					name: true,
					account: true,
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							phone: {
								select: {
									id: true,
									number: true,
								},
							},
							address: {
								select: {
									id: true,
								},
							},
						},
					},
				},
			});

			if (!existing) {
				return this.resultFail('Local partner not found');
			}

			if (session.type === 'contributor') {
				return this.resultFail('Permission denied');
			}

			if (session.type === 'user') {
				const isAdmin = await this.userService.isAdmin(session.id);
				if (!isAdmin.success) {
					return this.resultFail(isAdmin.error);
				}
				if (!isAdmin.data) {
					return this.resultFail('Permission denied');
				}
			}

			const newEmail = validatedInput.contact.email;
			const oldEmail = existing.contact?.email ?? null;
			const firebaseUid = existing.account.firebaseAuthUserId;

			const uniquenessResult = await this.localPartnerValidationService.validateUpdateUniqueness(validatedInput, {
				partnerId,
				existingName: existing.name,
				existingContactId: existing.contact.id,
				existingEmail: oldEmail,
				existingPhoneId: existing.contact.phone?.id ?? null,
				existingPhoneNumber: existing.contact.phone?.number ?? null,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const newDisplayName = `${validatedInput.contact.firstName} ${validatedInput.contact.lastName}`.trim();
			const oldDisplayName = `${existing.contact.firstName} ${existing.contact.lastName}`.trim();
			const shouldSyncFirebaseUser = newEmail !== oldEmail || newDisplayName !== oldDisplayName;
			if (shouldSyncFirebaseUser) {
				const firebaseResult = await this.firebaseAdminService.updateByUid(firebaseUid, {
					email: newEmail,
					displayName: newDisplayName,
				});
				if (!firebaseResult.success) {
					this.logger.warn('Could not update Firebase Auth user', { error: firebaseResult.error });
				}
			}

			const updated = await this.db.localPartner.update({
				where: { id: partnerId },
				data: {
					name: validatedInput.name,
					focuses: {
						deleteMany: {},
						create: validatedInput.focuses.map((focusId) => ({ focusId })),
					},
					contact: {
						update: {
							where: { id: existing.contact.id },
							data: this.buildContactUpdateData(
								validatedInput,
								existing.contact.phone?.id,
								existing.contact.phone?.number,
								existing.contact.address?.id,
							),
						},
					},
				},
			});

			const previousPhoneId = existing.contact.phone?.id;
			const previousPhoneNumber = existing.contact.phone?.number ?? null;
			const didRemovePhone = !validatedInput.contact.phone;
			const didChangePhoneNumber = !!validatedInput.contact.phone && validatedInput.contact.phone !== previousPhoneNumber;
			if ((didRemovePhone || didChangePhoneNumber) && previousPhoneId) {
				await this.contactRelationsService.deletePhoneIfUnused(previousPhoneId);
			}

			const previousAddressId = existing.contact.address?.id;
			const didRemoveAddress = !!previousAddressId && !this.contactRelationsService.hasAddressInput(validatedInput.contact);
			if (didRemoveAddress && previousAddressId) {
				await this.contactRelationsService.deleteAddressIfUnused(previousAddressId);
			}

			return this.resultOk(updated);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update local partner. Please try again later.');
		}
	}

	async delete(userId: string, localPartnerId: string): Promise<ServiceResult<{ id: string }>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const partner = await this.db.localPartner.findUnique({
				where: { id: localPartnerId },
				select: {
					id: true,
					contactId: true,
					accountId: true,
					account: {
						select: {
							firebaseAuthUserId: true,
						},
					},
					contact: {
						select: {
							phoneId: true,
							addressId: true,
						},
					},
					_count: {
						select: {
							recipients: true,
						},
					},
				},
			});

			if (!partner) {
				return this.resultFail('Local partner not found.');
			}

			if (partner._count.recipients > 0) {
				return this.resultFail('Cannot delete local partner because recipients are still assigned.');
			}

			const addressId = partner.contact?.addressId;
			const phoneId = partner.contact?.phoneId;
			const firebaseUid = partner.account.firebaseAuthUserId;
			const shouldDeletePhone = phoneId ? await this.contactRelationsService.shouldDeletePhone(phoneId) : false;

			await this.db.$transaction(async (tx) => {
				await tx.localPartner.delete({
					where: { id: localPartnerId },
				});

				await tx.contact.delete({
					where: { id: partner.contactId },
				});

				await tx.account.delete({
					where: { id: partner.accountId },
				});

				if (addressId) {
					await tx.address.delete({
						where: { id: addressId },
					});
				}

				if (phoneId && shouldDeletePhone) {
					await tx.phone.delete({
						where: { id: phoneId },
					});
				}
			});

			const firebaseDeleteResult = await this.firebaseAdminService.deleteByUidIfExists(firebaseUid);
			if (!firebaseDeleteResult.success) {
				this.logger.warn('Local partner deleted in DB but Firebase user deletion failed', {
					localPartnerId,
					firebaseUid,
					error: firebaseDeleteResult.error,
				});
			}

			return this.resultOk({ id: localPartnerId });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not delete local partner. Please try again later.');
		}
	}

	private buildContactCreateData(input: LocalPartnerFormCreateInput): Prisma.ContactCreateWithoutLocalPartnerInput {
		const addressInput = this.contactRelationsService.getAddressInput(input.contact);

		return {
			firstName: input.contact.firstName,
			lastName: input.contact.lastName,
			callingName: input.contact.callingName,
			email: input.contact.email,
			gender: input.contact.gender,
			language: input.contact.language,
			dateOfBirth: input.contact.dateOfBirth,
			profession: input.contact.profession,
			phone: input.contact.phone
				? {
						create: {
							number: input.contact.phone,
							hasWhatsApp: input.contact.hasWhatsApp,
						},
					}
				: undefined,
			address: addressInput ? { create: addressInput } : undefined,
		};
	}

	private buildContactUpdateData(
		input: LocalPartnerFormUpdateInput,
		phoneId: string | undefined,
		phoneNumber: string | undefined,
		addressId: string | undefined,
	): Prisma.ContactUpdateWithoutLocalPartnerInput {
		const addressInput = this.contactRelationsService.getAddressInput(input.contact);
		const phoneWriteOperation = this.contactRelationsService.buildPhoneWriteOperation({
			nextPhoneNumber: input.contact.phone,
			nextHasWhatsApp: input.contact.hasWhatsApp,
			currentPhoneId: phoneId,
			currentPhoneNumber: phoneNumber,
		});
		const addressWriteOperation = this.contactRelationsService.buildAddressWriteOperation({
			addressInput,
			currentAddressId: addressId,
		});

		return {
			firstName: input.contact.firstName,
			lastName: input.contact.lastName,
			callingName: input.contact.callingName,
			email: input.contact.email,
			gender: input.contact.gender,
			language: input.contact.language,
			dateOfBirth: input.contact.dateOfBirth,
			profession: input.contact.profession,
			phone: phoneWriteOperation,
			address: addressWriteOperation,
		};
	}
}
