import { Cause, CountryCode, Prisma, PrismaClient } from '@/generated/prisma/client';
import { Session } from '@/lib/firebase/current-account';
import { parseCsvText } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { ContactRelationsService } from '../contact/contact-relations.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserReadService } from '../user/user-read.service';
import { CandidateFormCreateInput, CandidateFormUpdateInput } from './candidate-form-input';
import { CandidateValidationService } from './candidate-validation.service';
import { CandidatePayload, Profile } from './candidate.types';

export class CandidateWriteService extends BaseService {
	private readonly candidatePayloadSelect = {
		id: true,
		suspendedAt: true,
		suspensionReason: true,
		successorName: true,
		termsAccepted: true,
		localPartner: { select: { id: true, name: true } },
		contact: {
			select: {
				id: true,
				firstName: true,
				lastName: true,
				callingName: true,
				email: true,
				gender: true,
				language: true,
				dateOfBirth: true,
				profession: true,
				phone: true,
				address: true,
			},
		},
		paymentInformation: {
			select: {
				id: true,
				code: true,
				mobileMoneyProvider: { select: { id: true, name: true } },
				phone: true,
			},
		},
	} as const;

	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly candidateValidationService: CandidateValidationService,
		private readonly contactRelationsService: ContactRelationsService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async deletePhoneIfOrphaned(phoneId: string): Promise<void> {
		await this.contactRelationsService.deletePhoneIfUnused(phoneId);
	}

	private async assertAdmin(userId: string): Promise<ServiceResult<true>> {
		const isAdmin = await this.userService.isAdmin(userId);
		if (!isAdmin.success) {
			return this.resultFail(isAdmin.error);
		}
		if (!isAdmin.data) {
			return this.resultFail('Permission denied');
		}

		return this.resultOk(true);
	}

	private buildCandidateWhere(
		causes?: Cause[],
		profiles?: Profile[],
		countryCode?: CountryCode | null,
	): Prisma.RecipientWhereInput {
		const where: Prisma.RecipientWhereInput = {
			programId: null,
		};

		if (countryCode) {
			where.AND = [
				{
					OR: [
						{
							contact: {
								address: {
									country: countryCode,
								},
							},
						},
						{
							AND: [
								{
									OR: [
										{
											contact: {
												address: null,
											},
										},
										{
											contact: {
												address: {
													country: null,
												},
											},
										},
									],
								},
								{
									localPartner: {
										contact: {
											address: {
												country: countryCode,
											},
										},
									},
								},
							],
						},
					],
				},
			];
		}

		if (causes && causes.length > 0) {
			where.localPartner = {
				causes: {
					hasSome: causes,
				},
			};
		}

		if (profiles && profiles.length > 0) {
			const contactFilters: Prisma.ContactWhereInput[] = [];

			const genderProfiles = profiles.filter((p) => p === Profile.male || p === Profile.female);

			if (genderProfiles.length > 0) {
				contactFilters.push({
					gender: {
						in: genderProfiles,
					},
				});
			}

			if (profiles.includes(Profile.youth)) {
				const nowDate = now();
				const youthCutoffDate = new Date(nowDate.getFullYear() - 25, nowDate.getMonth(), nowDate.getDate());

				contactFilters.push({
					dateOfBirth: {
						gte: youthCutoffDate,
					},
				});
			}

			if (contactFilters.length > 0) {
				where.contact = {
					OR: contactFilters,
				};
			}
		}

		return where;
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

	private buildCandidateCreateData(input: CandidateFormCreateInput): Prisma.RecipientCreateInput {
		const addressInput = this.contactRelationsService.getAddressInput(input.contact);
		const paymentInformationCreate = this.buildPaymentInformationCreateData(
			input.paymentInformation.mobileMoneyProviderId,
			input.paymentInformation.code,
			input.paymentInformation.phone,
		);

		return {
			startDate: null,
			program: undefined,
			suspendedAt: input.suspendedAt ?? null,
			suspensionReason: input.suspensionReason ?? null,
			successorName: input.successorName ?? null,
			termsAccepted: input.termsAccepted ?? false,
			localPartner: { connect: { id: input.localPartnerId! } },
			contact: {
				create: {
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
				},
			},
			paymentInformation: paymentInformationCreate ? { create: paymentInformationCreate } : undefined,
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
						create: { number: nextPhoneNumber },
					},
				};
			}

			return { create: { number: nextPhoneNumber } };
		}

		if (currentPhoneId) {
			return { disconnect: true };
		}

		return undefined;
	}

	private buildCandidateUpdateData(
		input: CandidateFormUpdateInput,
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
			input.paymentInformation.mobileMoneyProviderId ?? input.paymentInformation.code ?? input.paymentInformation.phone,
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
			program: undefined,
			suspendedAt: input.suspendedAt ?? null,
			suspensionReason: input.suspensionReason ?? null,
			successorName: input.successorName ?? null,
			termsAccepted: input.termsAccepted ?? false,
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

	async create(session: Session, input: CandidateFormCreateInput): Promise<ServiceResult<CandidatePayload>> {
		const validatedInputResult = this.candidateValidationService.validateCreateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			if (session.type === 'contributor') {
				return this.resultFail('Permission denied');
			}

			if (session.type === 'user') {
				const admin = await this.assertAdmin(session.id);
				if (!admin.success) {
					return this.resultFail(admin.error);
				}
			}

			if (session.type === 'local-partner') {
				validatedInput.localPartnerId = session.id;
			}
			if (!validatedInput.localPartnerId) {
				return this.resultFail('No local partner specified for candidate creation');
			}

			const uniquenessResult = await this.candidateValidationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const paymentPhoneNumber = validatedInput.paymentInformation.phone;
			const data = this.buildCandidateCreateData(validatedInput);

			return await this.db.$transaction(async (tx) => {
				const newCandidate = await tx.recipient.create({
					data,
					select: this.candidatePayloadSelect,
				});

				if (paymentPhoneNumber) {
					const firebaseResult = await this.firebaseAdminService.createByPhoneNumber(paymentPhoneNumber);
					if (!firebaseResult.success) {
						throw new Error(`Failed to create Firebase user: ${firebaseResult.error}`);
					}
				}

				return this.resultOk(newCandidate);
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create candidate. Please try again later.');
		}
	}

	async update(session: Session, input: CandidateFormUpdateInput): Promise<ServiceResult<CandidatePayload>> {
		if (session.type === 'contributor') {
			return this.resultFail('Permission denied');
		}
		const validatedInputResult = this.candidateValidationService.validateUpdateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		let previousPaymentPhoneNumber: string | null = null;
		let nextPaymentPhoneNumber: string | null = null;
		let phoneAdded = false;
		let phoneRemoved = false;
		let phoneChanged = false;

		try {
			const candidateId = validatedInput.id;
			const existing = await this.db.recipient.findUnique({
				where: { id: candidateId },
				select: {
					localPartnerId: true,
					programId: true,
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
				return this.resultFail('Candidate not found');
			}

			if (existing.programId !== null) {
				return this.resultFail('Not a candidate');
			}

			if (session.type === 'user') {
				const admin = await this.assertAdmin(session.id);
				if (!admin.success) {
					return this.resultFail(admin.error);
				}
			}

			if (session.type === 'local-partner') {
				const partnerId = session.id;
				if (existing.localPartnerId !== partnerId) {
					return this.resultFail('Permission denied');
				}
				validatedInput.localPartnerId = undefined;
			}

			const previousContactPhoneId = existing.contact.phone?.id ?? null;
			const previousPaymentPhoneId = existing.paymentInformation?.phone?.id ?? null;
			previousPaymentPhoneNumber = existing.paymentInformation?.phone?.number ?? null;
			nextPaymentPhoneNumber = validatedInput.paymentInformation.phone ?? null;

			const uniquenessResult = await this.candidateValidationService.validateUpdateUniqueness(validatedInput, {
				existingContactId: existing.contact.id,
				existingEmail: existing.contact.email,
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

			const updateData = this.buildCandidateUpdateData(validatedInput, {
				contactId: existing.contact.id,
				contactPhoneId: existing.contact.phone?.id,
				contactPhoneNumber: existing.contact.phone?.number,
				contactAddressId: existing.contact.address?.id,
				paymentInformationId: existing.paymentInformation?.id,
				paymentPhoneId: existing.paymentInformation?.phone?.id,
				paymentPhoneNumber: existing.paymentInformation?.phone?.number,
			});

			if (!previousPaymentPhoneNumber && !nextPaymentPhoneNumber) {
				const updatedCandidate = await this.db.recipient.update({
					where: { id: candidateId },
					data: updateData,
					select: this.candidatePayloadSelect,
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

				return this.resultOk(updatedCandidate);
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

			const updatedCandidate = await this.db.recipient.update({
				where: { id: candidateId },
				data: updateData,
				select: this.candidatePayloadSelect,
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

			return this.resultOk(updatedCandidate);
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

			return this.resultFail('Could not update candidate. Please try again later.');
		}
	}

	async delete(session: Session, candidateId: string): Promise<ServiceResult<{ id: string }>> {
		try {
			const existing = await this.db.recipient.findUnique({
				where: { id: candidateId },
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
				return this.resultFail('Candidate not found');
			}

			if (session.type === 'user') {
				const admin = await this.assertAdmin(session.id);
				if (!admin.success) {
					return this.resultFail(admin.error);
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
					where: { id: candidateId },
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
					this.logger.warn('Candidate deleted but contact phone cleanup failed', {
						candidateId,
						previousContactPhoneId,
						error: cleanupError,
					});
				}
			}
			if (previousPaymentPhoneId) {
				try {
					await this.contactRelationsService.deletePhoneIfUnused(previousPaymentPhoneId);
				} catch (cleanupError) {
					this.logger.warn('Candidate deleted but payment phone cleanup failed', {
						candidateId,
						previousPaymentPhoneId,
						error: cleanupError,
					});
				}
			}
			if (previousAddressId) {
				try {
					await this.contactRelationsService.deleteAddressIfUnused(previousAddressId);
				} catch (cleanupError) {
					this.logger.warn('Candidate deleted but address cleanup failed', {
						candidateId,
						previousAddressId,
						error: cleanupError,
					});
				}
			}

			if (paymentPhoneNumber) {
				try {
					const firebaseDeleteResult = await this.firebaseAdminService.deleteByPhoneNumberIfExists(paymentPhoneNumber);
					if (!firebaseDeleteResult.success) {
						this.logger.warn('Candidate deleted in DB but Firebase user deletion failed', {
							candidateId,
							paymentPhoneNumber,
							error: firebaseDeleteResult.error,
						});
					}
				} catch (cleanupError) {
					this.logger.warn('Candidate deleted in DB but Firebase cleanup threw', {
						candidateId,
						paymentPhoneNumber,
						error: cleanupError,
					});
				}
			}

			return this.resultOk({ id: candidateId });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not delete candidate. Please try again later.');
		}
	}

	async assignRandomCandidatesToProgram(
		programId: string,
		amountOfRecipientsForStart: number,
		countryCode: CountryCode,
		causes?: Cause[],
		profiles?: Profile[],
	): Promise<ServiceResult<{ assigned: number }>> {
		try {
			const where = this.buildCandidateWhere(causes, profiles, countryCode);

			const allAvailableCandidates = await this.db.recipient.findMany({
				where,
				select: { id: true },
			});

			if (allAvailableCandidates.length < amountOfRecipientsForStart) {
				return this.resultFail(
					`Not enough candidates available. Requested ${amountOfRecipientsForStart}, but only ${allAvailableCandidates.length} available.`,
				);
			}

			const shuffled = [...allAvailableCandidates].sort(() => Math.random() - 0.5);
			const selectedIds = shuffled.slice(0, amountOfRecipientsForStart).map((c) => c.id);

			await this.db.recipient.updateMany({
				where: { id: { in: selectedIds } },
				data: { programId },
			});

			return this.resultOk({ assigned: selectedIds.length });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not assign candidates: ${JSON.stringify(error)}`);
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

				if (!row.localPartnerId) {
					return this.resultFail(`Row ${rowNumber}: localPartnerId is required`);
				}

				const candidate: CandidateFormCreateInput = {
					suspendedAt: null,
					suspensionReason: null,
					successorName: null,
					termsAccepted: false,
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

				const result = await this.create(session, candidate);
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
