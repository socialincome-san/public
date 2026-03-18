import {
	Contributor,
	ContributorReferralSource,
	Prisma,
	PrismaClient,
	ProgramPermission,
} from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { DateTime } from 'luxon';
import { ContactRelationsService } from '../contact/contact-relations.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { SendgridSubscriptionService } from '../sendgrid/sendgrid-subscription.service';
import { SupportedLanguage } from '../sendgrid/types';
import { ContributorFormCreateInput, ContributorFormUpdateInput } from './contributor-form-input';
import { ContributorValidationService } from './contributor-validation.service';
import {
	BankContributorData,
	ContributorUpdateInput,
	ContributorWithContact,
	StripeContributorData,
} from './contributor.types';

export class ContributorWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly sendGridService: SendgridSubscriptionService,
		private readonly contributorValidationService: ContributorValidationService,
		private readonly contactRelationsService: ContactRelationsService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async applyContributorUpdate(
		contributorId: string,
		data: ContributorUpdateInput,
	): Promise<ServiceResult<Contributor>> {
		try {
			const existing = await this.db.contributor.findUnique({
				where: { id: contributorId },
				select: {
					account: true,
					contact: { select: { email: true } },
				},
			});

			if (!existing) {
				return this.resultFail('Contributor not found');
			}

			const emailInput = data.contact?.update?.data?.email;
			const newEmail = typeof emailInput === 'string' ? emailInput : undefined;
			const oldEmail = existing.contact?.email ?? null;

			if (!newEmail) {
				return this.resultFail('Contributor email is required');
			}

			if (newEmail !== oldEmail) {
				const firebaseResult = await this.firebaseAdminService.updateByUid(existing.account.firebaseAuthUserId, {
					email: newEmail,
				});

				if (!firebaseResult.success) {
					this.logger.warn('Could not update Firebase Auth user', {
						error: firebaseResult.error,
					});
				}
			}

			const updatedContributor = await this.db.contributor.update({
				where: { id: contributorId },
				data,
			});

			return this.resultOk(updatedContributor);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update contributor: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, input: ContributorFormUpdateInput): Promise<ServiceResult<Contributor>> {
		const validatedInputResult = this.contributorValidationService.validateUpdateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}
			const accessiblePrograms = accessibleProgramsResult.data;
			const hasOperatorAccess = accessiblePrograms.some((program) => program.permission === ProgramPermission.operator);
			if (!hasOperatorAccess) {
				return this.resultFail('No permissions to update contributor');
			}

			const existing = await this.db.contributor.findUnique({
				where: { id: validatedInput.id },
				select: {
					id: true,
					account: { select: { firebaseAuthUserId: true } },
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							phone: { select: { id: true, number: true } },
							address: { select: { id: true } },
						},
					},
				},
			});
			if (!existing) {
				return this.resultFail('Contributor not found');
			}
			const contributorProgramIds = await this.db.contribution.findMany({
				where: { contributorId: validatedInput.id },
				select: { campaign: { select: { programId: true } } },
			});
			const canOperateContributorPrograms = contributorProgramIds.some((entry) =>
				accessiblePrograms.some(
					(program) =>
						program.programId === entry.campaign.programId && program.permission === ProgramPermission.operator,
				),
			);
			if (!canOperateContributorPrograms) {
				return this.resultFail('No permissions to update contributor');
			}

			const uniquenessResult = await this.contributorValidationService.validateUpdateUniqueness(validatedInput, {
				existingContactId: existing.contact.id,
				existingEmail: existing.contact.email,
				existingPhoneId: existing.contact.phone?.id ?? null,
				existingPhoneNumber: existing.contact.phone?.number ?? null,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const newDisplayName = `${validatedInput.contact.firstName} ${validatedInput.contact.lastName}`.trim();
			const oldDisplayName = `${existing.contact.firstName} ${existing.contact.lastName}`.trim();
			if (validatedInput.contact.email !== existing.contact.email || newDisplayName !== oldDisplayName) {
				const firebaseResult = await this.firebaseAdminService.updateByUid(existing.account.firebaseAuthUserId, {
					email: validatedInput.contact.email,
					displayName: newDisplayName,
				});
				if (!firebaseResult.success) {
					this.logger.warn('Could not update Firebase Auth user', { error: firebaseResult.error });
				}
			}

			const updated = await this.db.contributor.update({
				where: { id: validatedInput.id },
				data: {
					referral: validatedInput.referral,
					paymentReferenceId: validatedInput.paymentReferenceId,
					stripeCustomerId: validatedInput.stripeCustomerId,
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

			return this.resultFail('Could not update contributor. Please try again later.');
		}
	}

	async updateSelf(contributorId: string, data: ContributorUpdateInput): Promise<ServiceResult<Contributor>> {
		try {
			return this.applyContributorUpdate(contributorId, data);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update contributor (self): ${JSON.stringify(error)}`);
		}
	}

	async getOrCreateContributorWithFirebaseAuth(
		contributorData: StripeContributorData,
	): Promise<ServiceResult<{ contributor: ContributorWithContact; isNewContributor: boolean }>> {
		try {
			const existingResult = await this.findByStripeCustomerOrEmail(
				contributorData.stripeCustomerId,
				contributorData.email || undefined,
			);

			if (!existingResult.success) {
				return this.resultFail(existingResult.error);
			}

			if (existingResult.data) {
				if (!existingResult.data.stripeCustomerId) {
					await this.updateStripeCustomerId(existingResult.data.id, contributorData.stripeCustomerId);
				}

				return this.resultOk({ contributor: existingResult.data, isNewContributor: false });
			}

			const createResult = await this.createContributorWithFirebaseAuth(contributorData);
			if (!createResult.success) {
				return this.resultFail(createResult.error);
			}

			return this.resultOk({ contributor: createResult.data, isNewContributor: true });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get or create contributor from Stripe customer: ${JSON.stringify(error)}`);
		}
	}

	async getOrCreateContributorForAccount(
		accountId: string,
		stripeCustomerId: string,
		contactId: string,
	): Promise<ServiceResult<{ contributor: ContributorWithContact; isNewContributor: boolean }>> {
		try {
			const existing = await this.db.contributor.findUnique({
				where: { accountId },
				include: { contact: true },
			});

			if (existing) {
				if (!existing.stripeCustomerId) {
					await this.updateStripeCustomerId(existing.id, stripeCustomerId);
					const updated = await this.db.contributor.findUnique({
						where: { id: existing.id },
						include: { contact: true },
					});
					const contributor = updated ?? { ...existing, stripeCustomerId };

					return this.resultOk({ contributor, isNewContributor: false });
				}

				return this.resultOk({ contributor: existing, isNewContributor: false });
			}

			const contributor = await this.db.contributor.create({
				data: {
					account: { connect: { id: accountId } },
					contact: { connect: { id: contactId } },
					stripeCustomerId,
					referral: ContributorReferralSource.other,
					needsOnboarding: false,
				},
				include: { contact: true },
			});

			return this.resultOk({ contributor, isNewContributor: true });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get or create contributor for account: ${JSON.stringify(error)}`);
		}
	}

	async getOrCreateReferenceIdByEmail(email: string): Promise<ServiceResult<string>> {
		try {
			const existingContributor = await this.db.contributor.findFirst({
				where: { contact: { email: email } },
				select: { id: true, contact: { select: { email: true } }, paymentReferenceId: true },
			});
			const referenceId =
				existingContributor?.paymentReferenceId && existingContributor.paymentReferenceId.length > 0
					? existingContributor.paymentReferenceId
					: DateTime.now().toMillis().toString();
			if (existingContributor && !existingContributor?.paymentReferenceId) {
				const res = await this.updateSelf(existingContributor.id, {
					paymentReferenceId: referenceId,
					contact: {
						update: {
							data: {
								email: existingContributor.contact.email,
							},
						},
					},
				});
				if (!res.success) {
					this.logger.error(res.error);

					return this.resultFail('Could not udate existing contributor with newly created reference ID');
				}
			}

			return this.resultOk(referenceId);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get or generate contributor reference ID: ${JSON.stringify(error)}`);
		}
	}

	async getOrCreateByReferenceId(contributorData: BankContributorData): Promise<ServiceResult<Contributor>> {
		try {
			const existingContributor = await this.db.contributor.findFirst({
				where: { paymentReferenceId: contributorData.paymentReferenceId },
			});
			if (existingContributor) {
				return this.resultOk(existingContributor);
			}

			const firebaseResult = await this.firebaseAdminService.getOrCreateUser({
				email: contributorData.email,
				displayName: `${contributorData.firstName} ${contributorData.lastName}`,
			});

			if (!firebaseResult.success) {
				return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}

			const newContributor = await this.db.contributor.create({
				data: {
					paymentReferenceId: contributorData.paymentReferenceId,
					referral: ContributorReferralSource.other,
					account: {
						create: {
							firebaseAuthUserId: firebaseResult.data.uid,
						},
					},
					contact: {
						create: {
							firstName: contributorData.firstName,
							lastName: contributorData.lastName,
							email: contributorData.email,
							language: contributorData.language,
						},
					},
				},
				include: { contact: true },
			});

			await this.sendGridService.subscribeToNewsletter({
				firstname: contributorData.firstName,
				lastname: contributorData.lastName,
				email: contributorData.email,
				language: contributorData.language as SupportedLanguage,
			});

			return this.resultOk(newContributor);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get or create contributor by reference ID: ${JSON.stringify(error)}`);
		}
	}

	private async createContributorWithFirebaseAuth(
		contributorData: StripeContributorData,
	): Promise<ServiceResult<ContributorWithContact>> {
		try {
			const firebaseResult = await this.firebaseAdminService.getOrCreateUser({
				email: contributorData.email,
				displayName: `${contributorData.firstName} ${contributorData.lastName}`,
			});

			if (!firebaseResult.success) {
				return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}

			const contributor = await this.db.contributor.create({
				data: {
					stripeCustomerId: contributorData.stripeCustomerId,
					referral: contributorData.referral,
					account: {
						create: {
							firebaseAuthUserId: firebaseResult.data.uid,
						},
					},
					contact: {
						create: {
							firstName: contributorData.firstName,
							lastName: contributorData.lastName,
							email: contributorData.email,
						},
					},
				},
				include: { contact: true },
			});

			return this.resultOk(contributor);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create contributor with Firebase Auth user: ${JSON.stringify(error)}`);
		}
	}

	private buildContactCreateData(input: ContributorFormCreateInput): Prisma.ContactCreateWithoutContributorInput {
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
		input: ContributorFormUpdateInput,
		currentPhoneId: string | undefined,
		currentPhoneNumber: string | undefined,
		currentAddressId: string | undefined,
	): Prisma.ContactUpdateWithoutContributorInput {
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
			phone: this.contactRelationsService.buildPhoneWriteOperation({
				nextPhoneNumber: input.contact.phone,
				nextHasWhatsApp: input.contact.hasWhatsApp,
				currentPhoneId,
				currentPhoneNumber,
			}),
			address: this.contactRelationsService.buildAddressWriteOperation({
				addressInput,
				currentAddressId,
			}),
		};
	}

	async create(userId: string, input: ContributorFormCreateInput): Promise<ServiceResult<Contributor>> {
		const validatedInputResult = this.contributorValidationService.validateCreateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}
			const hasOperatorAccess = accessibleProgramsResult.data.some(
				(program) => program.permission === ProgramPermission.operator,
			);
			if (!hasOperatorAccess) {
				return this.resultFail('No permission to create contributor');
			}

			const uniquenessResult = await this.contributorValidationService.validateCreateUniqueness(validatedInput);
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

			const contributor = await this.db.contributor.create({
				data: {
					referral: validatedInput.referral,
					paymentReferenceId: validatedInput.paymentReferenceId,
					stripeCustomerId: validatedInput.stripeCustomerId,
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

			return this.resultOk(contributor);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create contributor. Please try again later.');
		}
	}

	private async updateStripeCustomerId(contributorId: string, stripeCustomerId: string): Promise<ServiceResult<void>> {
		try {
			await this.db.contributor.update({
				where: { id: contributorId },
				data: { stripeCustomerId },
			});

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update contributor Stripe customer ID: ${JSON.stringify(error)}`);
		}
	}

	private async findByStripeCustomerOrEmail(
		stripeCustomerId: string,
		email?: string,
	): Promise<ServiceResult<ContributorWithContact | null>> {
		try {
			let contributor = await this.db.contributor.findFirst({
				where: { stripeCustomerId },
				include: { contact: true },
			});

			if (!contributor && email) {
				contributor = await this.db.contributor.findFirst({
					where: { contact: { email } },
					include: { contact: true },
				});
			}

			return this.resultOk(contributor);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not find contributor: ${JSON.stringify(error)}`);
		}
	}
}
