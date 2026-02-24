import { Contributor, ContributorReferralSource, OrganizationPermission, PrismaClient } from '@/generated/prisma/client';
import { DateTime } from 'luxon';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { SendgridSubscriptionService } from '../sendgrid/sendgrid-subscription.service';
import { SupportedLanguage } from '../sendgrid/types';
import {
	BankContributorData,
	ContributorDonationCertificate,
	ContributorFormCreateInput,
	ContributorOption,
	ContributorPayload,
	ContributorSession,
	ContributorTableView,
	ContributorTableViewRow,
	ContributorUpdateInput,
	ContributorWithContact,
	StripeContributorData,
} from './contributor.types';

export class ContributorService extends BaseService {
	private readonly organizationAccessService: OrganizationAccessService;
	private readonly firebaseAdminService: FirebaseAdminService;
	private readonly sendGridService: SendgridSubscriptionService;

	constructor(db: PrismaClient, organizationAccessService: OrganizationAccessService, firebaseAdminService: FirebaseAdminService, sendGridService: SendgridSubscriptionService) {
		super(db);
		this.organizationAccessService = organizationAccessService;
		this.firebaseAdminService = firebaseAdminService;
		this.sendGridService = sendGridService;
	}

	async get(userId: string, contributorId: string): Promise<ServiceResult<ContributorPayload>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId } = activeOrgResult.data;

			const contributor = await this.db.contributor.findUnique({
				where: {
					id: contributorId,
					OR: [
						{
							contributions: {
								some: { campaign: { organizationId } },
							},
						},
						{
							contributions: {
								none: {},
							},
						},
					],
				},
				select: {
					id: true,
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							gender: true,
							callingName: true,
							email: true,
							language: true,
							phone: true,
							profession: true,
							dateOfBirth: true,
							address: true,
						},
					},
					referral: true,
					paymentReferenceId: true,
					stripeCustomerId: true,
				},
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			return this.resultOk(contributor);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not get contributor: ${JSON.stringify(error)}`);
		}
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

			const newEmail = data.contact?.update?.data?.email?.toString();
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

			const contributorId = contributor.id?.toString();
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

	async getOptions(userId: string): Promise<ServiceResult<ContributorOption[]>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId } = activeOrgResult.data;

			const contributors = await this.db.contributor.findMany({
				where: {
					OR: [
						{
							contributions: {
								some: { campaign: { organizationId } },
							},
						},
						{
							contributions: {
								none: {},
							},
						},
					],
				},
				select: {
					id: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
				orderBy: { contact: { firstName: 'asc' } },
			});

			const options: ContributorOption[] = contributors.map((contributor) => ({
				id: contributor.id,
				name: `${contributor.contact?.firstName ?? ''} ${contributor.contact?.lastName ?? ''}`.trim(),
			}));

			return this.resultOk(options);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch contributor options: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<ContributorTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;

			const contributors = await this.db.contributor.findMany({
				where: {
					OR: [
						{
							contributions: {
								some: { campaign: { organizationId } },
							},
						},
						{
							contributions: {
								none: {},
							},
						},
					],
				},
				select: {
					id: true,
					createdAt: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
							address: { select: { country: true } },
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: ContributorTableViewRow[] = contributors.map((c) => ({
				id: c.id,
				firstName: c.contact?.firstName ?? '',
				lastName: c.contact?.lastName ?? '',
				email: c.contact?.email ?? '',
				country: c.contact?.address?.country ?? null,
				createdAt: c.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch contributors: ${JSON.stringify(error)}`);
		}
	}

	async getByIds(contributorIds?: string[]): Promise<ServiceResult<ContributorDonationCertificate[]>> {
		try {
			const result = await this.db.contributor.findMany({
				where: contributorIds && contributorIds.length > 0 ? { id: { in: contributorIds } } : {},
				select: {
					id: true,
					account: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							language: true,
							email: true,
							address: true,
						},
					},
				},
				orderBy: { contact: { firstName: 'asc' } },
			});

			const contributors = result.map((c) => ({
				id: c.id,
				firstName: c.contact.firstName,
				lastName: c.contact.lastName,
				language: c.contact.language,
				email: c.contact.email,
				address: c.contact.address,
				authId: c.account.firebaseAuthUserId,
			}));

			return this.resultOk(contributors);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch contributor IDs for certificates: ${JSON.stringify(error)}`);
		}
	}

	async findByStripeCustomerOrEmail(
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
					// Prefer freshly fetched; if null (e.g. race), return existing with the id we just set
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
			let referenceId: string;
			const existingContributor = await this.db.contributor.findFirst({
				where: { contact: { email: email } },
				select: { id: true, contact: { select: { email: true } }, paymentReferenceId: true },
			});
			referenceId = existingContributor?.paymentReferenceId || DateTime.now().toMillis().toString();
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

	async findByPaymentReferenceIds(paymentReferenceIds: string[]): Promise<ServiceResult<Contributor[]>> {
		try {
			const contributors = await this.db.contributor.findMany({
				where: { paymentReferenceId: { in: paymentReferenceIds } },
				include: { contact: true },
			});

			if (!contributors) {
				return this.resultFail('Contributor not found');
			}

			return this.resultOk(contributors);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not find contributor by Payment Reference ID: ${JSON.stringify(error)}`);
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

	async getCurrentContributorSession(firebaseAuthUserId: string): Promise<ServiceResult<ContributorSession>> {
		try {
			const contributor = await this.db.contributor.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					stripeCustomerId: true,
					referral: true,
					contact: {
						select: {
							gender: true,
							email: true,
							firstName: true,
							lastName: true,
							language: true,
							address: {
								select: {
									street: true,
									number: true,
									city: true,
									zip: true,
									country: true,
								},
							},
						},
					},
				},
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			const session: ContributorSession = {
				type: 'contributor',
				id: contributor.id,
				gender: contributor.contact?.gender ?? null,
				referral: contributor.referral ?? null,
				email: contributor.contact?.email ?? null,
				firstName: contributor.contact?.firstName ?? null,
				lastName: contributor.contact?.lastName ?? null,
				stripeCustomerId: contributor.stripeCustomerId ?? null,
				language: contributor.contact?.language ?? null,
				street: contributor.contact?.address?.street ?? null,
				number: contributor.contact?.address?.number ?? null,
				city: contributor.contact?.address?.city ?? null,
				zip: contributor.contact?.address?.zip ?? null,
				country: contributor.contact?.address?.country ?? null,
			};

			return this.resultOk(session);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch contributor session: ${JSON.stringify(error)}`);
		}
	}
}
