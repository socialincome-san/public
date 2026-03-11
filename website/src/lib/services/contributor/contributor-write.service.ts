import {
	Contributor,
	ContributorReferralSource,
	OrganizationPermission,
	PrismaClient,
} from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { DateTime } from 'luxon';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { SendgridSubscriptionService } from '../sendgrid/sendgrid-subscription.service';
import { SupportedLanguage } from '../sendgrid/types';
import {
	BankContributorData,
	ContributorFormCreateInput,
	ContributorUpdateInput,
	ContributorWithContact,
	StripeContributorData,
} from './contributor.types';

export class ContributorWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly organizationAccessService: OrganizationAccessService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly sendGridService: SendgridSubscriptionService,
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

	async update(userId: string, contributor: ContributorUpdateInput): Promise<ServiceResult<Contributor>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			if (activeOrgResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to update contributor');
			}

			const contributorId = typeof contributor.id === 'string' ? contributor.id : undefined;
			if (!contributorId) {
				return this.resultFail('Contributor ID is required');
			}

			return this.applyContributorUpdate(contributorId, contributor);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update contributor: ${JSON.stringify(error)}`);
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
			const referenceId = existingContributor?.paymentReferenceId || DateTime.now().toMillis().toString();
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

	async create(userId: string, input: ContributorFormCreateInput): Promise<ServiceResult<Contributor>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			if (activeOrgResult.data.permission !== OrganizationPermission.edit) {
				return this.resultFail('No permission to create contributor');
			}

			const firebaseResult = await this.firebaseAdminService.getOrCreateUser({
				email: input.email,
				displayName: `${input.firstName} ${input.lastName}`,
			});

			if (!firebaseResult.success) {
				return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}

			const contributor = await this.db.contributor.create({
				data: {
					referral: input.referral,
					account: {
						create: {
							firebaseAuthUserId: firebaseResult.data.uid,
						},
					},
					contact: {
						create: {
							firstName: input.firstName,
							lastName: input.lastName,
							callingName: input.callingName ?? null,
							email: input.email,
							gender: input.gender,
							language: input.language,
							dateOfBirth: input.dateOfBirth,
							profession: input.profession,
							address: input.address ? { create: input.address } : undefined,
						},
					},
				},
			});

			return this.resultOk(contributor);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create contributor: ${JSON.stringify(error)}`);
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
