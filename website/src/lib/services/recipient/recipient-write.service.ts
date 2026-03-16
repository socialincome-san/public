import { Prisma, PrismaClient, ProgramPermission, Recipient } from '@/generated/prisma/client';
import { Session } from '@/lib/firebase/current-account';
import { parseCsvText } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { ContactRelationsService } from '../contact/contact-relations.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { RecipientFormCreateInput, RecipientFormUpdateInput } from './recipient-form-input';
import { RecipientValidationService } from './recipient-validation.service';
import { RecipientWithPaymentInfo } from './recipient.types';

export class RecipientWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly validationService: RecipientValidationService,
		private readonly contactRelationsService: ContactRelationsService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async deletePhoneIfOrphaned(phoneId: string): Promise<void> {
		await this.contactRelationsService.deletePhoneIfUnused(phoneId);
	}

	async create(session: Session, input: RecipientFormCreateInput): Promise<ServiceResult<Recipient>> {
		try {
			const validatedInputResult = this.validationService.validateCreateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedRecipient = validatedInputResult.data;

			const programId = validatedRecipient.programId;
			if (!programId) {
				return this.resultFail('No program specified for recipient creation');
			}

			if (session.type === 'user') {
				const userId = session.id;
				const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
				if (!accessResult.success) {
					return this.resultFail(accessResult.error);
				}
				const hasOperatorAccess = accessResult.data.some(
					(a) => a.programId === programId && a.permission === ProgramPermission.operator,
				);
				if (!hasOperatorAccess) {
					return this.resultFail('Permission denied');
				}
			}

			if (session.type === 'local-partner') {
				validatedRecipient.localPartnerId = session.id;
			}
			if (!validatedRecipient.localPartnerId) {
				return this.resultFail('No local partner specified for recipient creation');
			}

			if (session.type === 'contributor') {
				return this.resultFail('Permission denied');
			}

			const uniquenessResult = await this.validationService.validateCreateUniqueness(validatedRecipient);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const paymentPhoneNumber = validatedRecipient.paymentInformation.phone;
			const contactCreateData = this.buildContactCreateData(validatedRecipient);
			const paymentInformationCreate = this.buildPaymentInformationCreateData(
				validatedRecipient.paymentInformation.mobileMoneyProviderId,
				validatedRecipient.paymentInformation.code,
				paymentPhoneNumber,
			);

			return await this.db.$transaction(async (tx) => {
				const data: Prisma.RecipientCreateInput = {
					startDate: validatedRecipient.startDate ?? null,
					suspendedAt: validatedRecipient.suspendedAt ?? null,
					suspensionReason: validatedRecipient.suspensionReason ?? null,
					successorName: validatedRecipient.successorName ?? null,
					termsAccepted: validatedRecipient.termsAccepted ?? false,

					program: { connect: { id: validatedRecipient.programId! } },
					localPartner: { connect: { id: validatedRecipient.localPartnerId! } },
					contact: { create: contactCreateData },
					paymentInformation: paymentInformationCreate ? { create: paymentInformationCreate } : undefined,
				};

				const newRecipient = await tx.recipient.create({ data });

				if (paymentPhoneNumber) {
					const firebaseResult = await this.firebaseAdminService.createByPhoneNumber(paymentPhoneNumber);
					if (!firebaseResult.success) {
						throw new Error(`Failed to create Firebase user: ${firebaseResult.error}`);
					}
				}

				return this.resultOk(newRecipient);
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create recipient. Please try again later.');
		}
	}

	async update(session: Session, input: RecipientFormUpdateInput): Promise<ServiceResult<Recipient>> {
		if (session.type === 'contributor') {
			return this.resultFail('Permission denied');
		}
		const validatedUpdateInputResult = this.validationService.validateUpdateInput(input);
		if (!validatedUpdateInputResult.success) {
			return this.resultFail(validatedUpdateInputResult.error);
		}
		const validatedInput = validatedUpdateInputResult.data;
		let previousPaymentPhoneNumber: string | null = null;
		let nextPaymentPhoneNumber: string | null = null;
		let phoneAdded = false;
		let phoneRemoved = false;
		let phoneChanged = false;
		try {
			const recipientId = validatedInput.id;
			const existing = await this.db.recipient.findUnique({
				where: { id: recipientId },
				select: {
					programId: true,
					localPartnerId: true,
					contact: {
						select: {
							id: true,
							email: true,
							phone: { select: { id: true, number: true } },
							address: { select: { id: true } },
						},
					},
					paymentInformation: {
						select: {
							id: true,
							code: true,
							phone: { select: { id: true, number: true } },
						},
					},
				},
			});

			if (!existing) {
				return this.resultFail('Recipient not found');
			}

			if (session.type === 'user') {
				const userId = session.id;
				const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
				if (!accessResult.success) {
					return this.resultFail(accessResult.error);
				}
				const existingProgramAllowed = accessResult.data.some(
					(a) => a.programId === existing.programId && a.permission === ProgramPermission.operator,
				);
				if (!existingProgramAllowed) {
					return this.resultFail('Permission denied');
				}
				const requestedProgramId = validatedInput.programId;
				if (requestedProgramId) {
					const requestedProgramAllowed = accessResult.data.some(
						(a) => a.programId === requestedProgramId && a.permission === ProgramPermission.operator,
					);
					if (!requestedProgramAllowed) {
						return this.resultFail('Permission denied');
					}
				}
			}

			if (session.type === 'local-partner') {
				const partnerId = session.id;
				if (existing.localPartnerId !== partnerId) {
					return this.resultFail('Permission denied');
				}
				validatedInput.localPartnerId = undefined;
				validatedInput.programId = undefined;
			}

			const previousContactPhoneId = existing.contact.phone?.id ?? null;
			const previousPaymentPhoneId = existing.paymentInformation?.phone?.id ?? null;
			previousPaymentPhoneNumber = existing.paymentInformation?.phone?.number ?? null;
			nextPaymentPhoneNumber = validatedInput.paymentInformation.phone ?? null;

			const uniquenessResult = await this.validationService.validateUpdateUniqueness(validatedInput, {
				existingContactId: existing.contact.id,
				existingEmail: existing.contact.email ?? null,
				existingContactPhoneId: existing.contact.phone?.id ?? null,
				existingContactPhoneNumber: existing.contact.phone?.number ?? null,
				existingPaymentInformationId: existing.paymentInformation?.id ?? null,
				existingPaymentCode: existing.paymentInformation?.code ?? null,
				existingPaymentPhoneId: existing.paymentInformation?.phone?.id ?? null,
				existingPaymentPhoneNumber: existing.paymentInformation?.phone?.number ?? null,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const updateData = this.buildRecipientUpdateData(validatedInput, {
				contactId: existing.contact.id,
				contactPhoneId: existing.contact.phone?.id,
				contactPhoneNumber: existing.contact.phone?.number,
				contactAddressId: existing.contact.address?.id,
				paymentInformationId: existing.paymentInformation?.id,
				paymentPhoneId: existing.paymentInformation?.phone?.id,
				paymentPhoneNumber: existing.paymentInformation?.phone?.number,
			});

			if (!previousPaymentPhoneNumber && !nextPaymentPhoneNumber) {
				const updatedRecipient = await this.db.recipient.update({
					where: { id: recipientId },
					data: updateData,
				});

				const previousAddressId = existing.contact.address?.id;
				const didRemoveAddress =
					!!previousAddressId && !this.contactRelationsService.hasAddressInput(validatedInput.contact);
				if (didRemoveAddress && previousAddressId) {
					await this.contactRelationsService.deleteAddressIfUnused(previousAddressId);
				}

				if (previousContactPhoneId) {
					await this.deletePhoneIfOrphaned(previousContactPhoneId);
				}

				return this.resultOk(updatedRecipient);
			}

			phoneAdded = !previousPaymentPhoneNumber && !!nextPaymentPhoneNumber;
			phoneRemoved = !!previousPaymentPhoneNumber && !nextPaymentPhoneNumber;
			phoneChanged =
				!!previousPaymentPhoneNumber && !!nextPaymentPhoneNumber && previousPaymentPhoneNumber !== nextPaymentPhoneNumber;

			if (phoneAdded) {
				const firebaseResult = await this.firebaseAdminService.createByPhoneNumber(nextPaymentPhoneNumber!);
				if (!firebaseResult.success) {
					return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
				}
			}

			if (phoneRemoved) {
				await this.firebaseAdminService.deleteByPhoneNumberIfExists(previousPaymentPhoneNumber!);
			}

			if (phoneChanged) {
				const firebaseResult = await this.firebaseAdminService.updateByPhoneNumber(
					previousPaymentPhoneNumber!,
					nextPaymentPhoneNumber!,
				);

				if (!firebaseResult.success) {
					return this.resultFail(`Failed to update Firebase user: ${firebaseResult.error}`);
				}
			}

			const updatedRecipient = await this.db.recipient.update({
				where: { id: recipientId },
				data: updateData,
			});

			const previousAddressId = existing.contact.address?.id;
			const didRemoveAddress = !!previousAddressId && !this.contactRelationsService.hasAddressInput(validatedInput.contact);
			if (didRemoveAddress && previousAddressId) {
				await this.contactRelationsService.deleteAddressIfUnused(previousAddressId);
			}

			if (previousContactPhoneId) {
				await this.deletePhoneIfOrphaned(previousContactPhoneId);
			}

			if (previousPaymentPhoneId) {
				await this.deletePhoneIfOrphaned(previousPaymentPhoneId);
			}

			return this.resultOk(updatedRecipient);
		} catch (error) {
			this.logger.error(error);

			if (phoneAdded && nextPaymentPhoneNumber) {
				await this.firebaseAdminService.deleteByPhoneNumberIfExists(nextPaymentPhoneNumber);
			}

			if (phoneRemoved && previousPaymentPhoneNumber) {
				await this.firebaseAdminService.createByPhoneNumber(previousPaymentPhoneNumber);
			}

			if (phoneChanged && previousPaymentPhoneNumber && nextPaymentPhoneNumber) {
				await this.firebaseAdminService.updateByPhoneNumber(nextPaymentPhoneNumber, previousPaymentPhoneNumber);
			}

			return this.resultFail('Could not update recipient. Please try again later.');
		}
	}

	private buildContactCreateData(input: RecipientFormCreateInput): Prisma.ContactCreateWithoutRecipientInput {
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

	private buildPaymentInformationCreateData(
		mobileMoneyProviderId: string | undefined,
		code: string | null,
		phoneNumber: string | undefined,
	): Prisma.PaymentInformationCreateWithoutRecipientsInput | undefined {
		const hasValue = !!mobileMoneyProviderId || !!code || !!phoneNumber;
		if (!hasValue) {
			return undefined;
		}

		return {
			mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : undefined,
			code: code ?? null,
			phone: phoneNumber ? { create: { number: phoneNumber } } : undefined,
		};
	}

	private buildRecipientUpdateData(
		input: RecipientFormUpdateInput,
		context: {
			contactId: string;
			contactPhoneId: string | undefined;
			contactPhoneNumber: string | undefined;
			contactAddressId: string | undefined;
			paymentInformationId: string | undefined;
			paymentPhoneId: string | undefined;
			paymentPhoneNumber: string | undefined;
		},
	): Prisma.RecipientUpdateInput {
		const addressInput = this.contactRelationsService.getAddressInput(input.contact);
		const contactPhoneWriteOperation = this.contactRelationsService.buildPhoneWriteOperation({
			nextPhoneNumber: input.contact.phone,
			nextHasWhatsApp: input.contact.hasWhatsApp,
			currentPhoneId: context.contactPhoneId,
			currentPhoneNumber: context.contactPhoneNumber,
		});
		const addressWriteOperation = this.contactRelationsService.buildAddressWriteOperation({
			addressInput,
			currentAddressId: context.contactAddressId,
		});
		const paymentPhoneWriteOperation = this.buildPaymentPhoneWriteOperation({
			nextPhoneNumber: input.paymentInformation.phone,
			currentPhoneId: context.paymentPhoneId,
			currentPhoneNumber: context.paymentPhoneNumber,
		});
		const hasPaymentPayload = Boolean(
			input.paymentInformation.mobileMoneyProviderId || input.paymentInformation.code || input.paymentInformation.phone,
		);
		const paymentInformationWrite: Prisma.PaymentInformationUpdateOneWithoutRecipientsNestedInput | undefined =
			context.paymentInformationId
				? {
						upsert: {
							where: { id: context.paymentInformationId },
							create: {
								mobileMoneyProvider: input.paymentInformation.mobileMoneyProviderId
									? { connect: { id: input.paymentInformation.mobileMoneyProviderId } }
									: undefined,
								code: input.paymentInformation.code ?? null,
								phone: input.paymentInformation.phone
									? {
											create: {
												number: input.paymentInformation.phone,
											},
										}
									: undefined,
							},
							update: {
								mobileMoneyProvider: input.paymentInformation.mobileMoneyProviderId
									? { connect: { id: input.paymentInformation.mobileMoneyProviderId } }
									: { disconnect: true },
								code: input.paymentInformation.code ?? null,
								phone: paymentPhoneWriteOperation,
							},
						},
					}
				: hasPaymentPayload
					? {
							create: {
								mobileMoneyProvider: input.paymentInformation.mobileMoneyProviderId
									? { connect: { id: input.paymentInformation.mobileMoneyProviderId } }
									: undefined,
								code: input.paymentInformation.code ?? null,
								phone: input.paymentInformation.phone
									? {
											create: {
												number: input.paymentInformation.phone,
											},
										}
									: undefined,
							},
						}
					: undefined;

		return {
			startDate: input.startDate ?? null,
			suspendedAt: input.suspendedAt ?? null,
			suspensionReason: input.suspensionReason ?? null,
			successorName: input.successorName ?? null,
			termsAccepted: input.termsAccepted ?? false,
			...(input.programId && { program: { connect: { id: input.programId } } }),
			...(input.localPartnerId && { localPartner: { connect: { id: input.localPartnerId } } }),
			contact: {
				update: {
					where: { id: context.contactId },
					data: {
						firstName: input.contact.firstName,
						lastName: input.contact.lastName,
						callingName: input.contact.callingName,
						email: input.contact.email,
						gender: input.contact.gender,
						language: input.contact.language,
						dateOfBirth: input.contact.dateOfBirth,
						profession: input.contact.profession,
						phone: contactPhoneWriteOperation,
						address: addressWriteOperation,
					},
				},
			},
			...(paymentInformationWrite ? { paymentInformation: paymentInformationWrite } : {}),
		};
	}

	private buildPaymentPhoneWriteOperation({
		nextPhoneNumber,
		currentPhoneId,
		currentPhoneNumber,
	}: {
		nextPhoneNumber: string | undefined;
		currentPhoneId: string | undefined;
		currentPhoneNumber: string | undefined;
	}): Prisma.PhoneUpdateOneWithoutPaymentInformationsNestedInput | undefined {
		if (nextPhoneNumber) {
			if (currentPhoneId && currentPhoneNumber === nextPhoneNumber) {
				return undefined;
			}

			if (currentPhoneId) {
				return {
					connectOrCreate: {
						where: { number: nextPhoneNumber },
						create: {
							number: nextPhoneNumber,
						},
					},
				};
			}

			return {
				create: {
					number: nextPhoneNumber,
				},
			};
		}

		if (currentPhoneId) {
			return {
				disconnect: true,
			};
		}

		return undefined;
	}

	async updateSelf(
		recipientId: string,
		data: Prisma.RecipientUpdateInput,
		options: {
			oldPaymentPhone: string | null;
			newPaymentPhone: string | null;
		},
	): Promise<ServiceResult<RecipientWithPaymentInfo>> {
		try {
			const existing = await this.db.recipient.findUnique({
				where: { id: recipientId },
				select: {
					contact: {
						select: {
							phone: { select: { id: true } },
						},
					},
					paymentInformation: {
						select: {
							phone: { select: { id: true } },
						},
					},
				},
			});

			if (!existing) {
				return this.resultFail('Recipient not found');
			}

			const phoneChanged =
				options.oldPaymentPhone && options.newPaymentPhone && options.oldPaymentPhone !== options.newPaymentPhone;

			if (phoneChanged) {
				const firebaseResult = await this.firebaseAdminService.updateByPhoneNumber(
					options.oldPaymentPhone!,
					options.newPaymentPhone!,
				);

				if (!firebaseResult.success) {
					return this.resultFail(`Failed to update Firebase phone number: ${firebaseResult.error}`);
				}
			}

			const updatedRecipient = await this.db.recipient.update({
				where: { id: recipientId },
				data,
				include: {
					contact: { include: { phone: true } },
					paymentInformation: {
						include: {
							phone: true,
							mobileMoneyProvider: true,
						},
					},
					program: {
						include: {
							country: {
								select: {
									isoCode: true,
								},
							},
						},
					},
					localPartner: true,
				},
			});

			const previousContactPhoneId = existing.contact.phone?.id;
			const previousPaymentPhoneId = existing.paymentInformation?.phone?.id;

			if (previousContactPhoneId) {
				await this.deletePhoneIfOrphaned(previousContactPhoneId);
			}

			if (previousPaymentPhoneId) {
				await this.deletePhoneIfOrphaned(previousPaymentPhoneId);
			}

			return this.resultOk(updatedRecipient);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to update recipient: ${JSON.stringify(error)}`);
		}
	}

	async delete(session: Session, recipientId: string): Promise<ServiceResult<{ id: string }>> {
		try {
			const existing = await this.db.recipient.findUnique({
				where: { id: recipientId },
				select: {
					id: true,
					contactId: true,
					paymentInformationId: true,
					programId: true,
					localPartnerId: true,
					contact: {
						select: {
							phoneId: true,
							addressId: true,
						},
					},
					paymentInformation: {
						select: {
							phone: { select: { id: true, number: true } },
						},
					},
				},
			});

			if (!existing) {
				return this.resultFail('Recipient not found');
			}

			if (session.type === 'user') {
				const userId = session.id;
				const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
				if (!accessResult.success) {
					return this.resultFail(accessResult.error);
				}
				const allowed = accessResult.data.some(
					(a) => a.programId === existing.programId && a.permission === ProgramPermission.operator,
				);
				if (!allowed) {
					return this.resultFail('Permission denied');
				}
			}

			if (session.type === 'local-partner') {
				const partnerId = session.id;
				if (existing.localPartnerId !== partnerId) {
					return this.resultFail('Permission denied');
				}
			}

			if (session.type === 'contributor') {
				return this.resultFail('Permission denied');
			}

			const paymentPhoneNumber = existing.paymentInformation?.phone?.number;
			const previousContactPhoneId = existing.contact.phoneId;
			const previousPaymentPhoneId = existing.paymentInformation?.phone?.id;
			const previousAddressId = existing.contact.addressId;

			await this.db.$transaction(async (tx) => {
				await tx.recipient.delete({
					where: { id: recipientId },
				});

				if (existing.paymentInformationId) {
					await tx.paymentInformation.delete({
						where: { id: existing.paymentInformationId },
					});
				}

				await tx.contact.delete({
					where: { id: existing.contactId },
				});
			});

			if (previousContactPhoneId) {
				try {
					await this.contactRelationsService.deletePhoneIfUnused(previousContactPhoneId);
				} catch (cleanupError) {
					this.logger.warn('Recipient deleted but contact phone cleanup failed', {
						recipientId,
						previousContactPhoneId,
						error: cleanupError,
					});
				}
			}
			if (previousPaymentPhoneId) {
				try {
					await this.contactRelationsService.deletePhoneIfUnused(previousPaymentPhoneId);
				} catch (cleanupError) {
					this.logger.warn('Recipient deleted but payment phone cleanup failed', {
						recipientId,
						previousPaymentPhoneId,
						error: cleanupError,
					});
				}
			}
			if (previousAddressId) {
				try {
					await this.contactRelationsService.deleteAddressIfUnused(previousAddressId);
				} catch (cleanupError) {
					this.logger.warn('Recipient deleted but address cleanup failed', {
						recipientId,
						previousAddressId,
						error: cleanupError,
					});
				}
			}

			if (paymentPhoneNumber) {
				try {
					const firebaseDeleteResult = await this.firebaseAdminService.deleteByPhoneNumberIfExists(paymentPhoneNumber);
					if (!firebaseDeleteResult.success) {
						this.logger.warn('Recipient deleted in DB but Firebase user deletion failed', {
							recipientId,
							paymentPhoneNumber,
							error: firebaseDeleteResult.error,
						});
					}
				} catch (cleanupError) {
					this.logger.warn('Recipient deleted in DB but Firebase cleanup threw', {
						recipientId,
						paymentPhoneNumber,
						error: cleanupError,
					});
				}
			}

			return this.resultOk({ id: recipientId });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not delete recipient. Please try again later.');
		}
	}

	async importCsv(session: Session, file: File): Promise<ServiceResult<{ created: number }>> {
		try {
			let created = 0;
			const text = await file.text();
			const rows = parseCsvText(text);
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				const rowNumber = i + 1;

				if (!row.firstName || !row.lastName) {
					return this.resultFail(`Row ${rowNumber}: firstName and lastName are required`);
				}

				if (!row.programId) {
					return this.resultFail(`Row ${rowNumber}: programId is required`);
				}

				if (!row.localPartnerId) {
					return this.resultFail(`Row ${rowNumber}: localPartnerId is required`);
				}

				const recipient: RecipientFormCreateInput = {
					startDate: null,
					suspendedAt: null,
					suspensionReason: null,
					successorName: null,
					termsAccepted: false,
					programId: row.programId,
					localPartnerId: row.localPartnerId,
					paymentInformation: {
						mobileMoneyProviderId: undefined,
						code: null,
						phone: undefined,
					},
					contact: {
						firstName: row.firstName,
						lastName: row.lastName,
						callingName: null,
						email: null,
						gender: null,
						language: null,
						dateOfBirth: null,
						profession: null,
						phone: undefined,
						hasWhatsApp: false,
						street: null,
						number: null,
						city: null,
						zip: null,
						country: null,
					},
				};

				const result = await this.create(session, recipient);

				if (!result.success) {
					return this.resultFail(`Row ${rowNumber}: ${result.error}`);
				}

				created++;
			}

			return this.resultOk({ created });
		} catch (error) {
			return this.resultFail(error instanceof Error ? error.message : 'Failed to parse CSV file');
		}
	}
}
