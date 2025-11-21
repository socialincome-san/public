import { Contributor, ContributorReferralSource } from '@prisma/client';
import { DateTime } from 'luxon';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseService } from '../firebase/firebase.service';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	BankContributorData,
	ContributorDonationCertificate,
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
	private organizationAccessService = new OrganizationAccessService();
	private firebaseService = new FirebaseService();

	async get(userId: string, contributorId: string): Promise<ServiceResult<ContributorPayload>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const contributor = await this.db.contributor.findUnique({
				where: {
					id: contributorId,
					contributions: {
						some: {
							campaign: { organizationId: activeOrgResult.data.id },
						},
					},
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
			return this.resultFail('Could not get contributor');
		}
	}

	private async applyContributorUpdate(
		contributorId: string,
		data: ContributorUpdateInput,
	): Promise<ServiceResult<Contributor>> {
		try {
			const existing = await this.db.contributor.findUnique({
				where: { id: contributorId },
				select: { account: true },
			});

			if (!existing) {
				return this.resultFail('Contributor not found');
			}

			if (!data.contact?.update?.data?.email) {
				return this.resultFail('Contributor email is required');
			}

			const firebaseResult = await this.firebaseService.updateByUid(existing.account.firebaseAuthUserId, {
				email: data.contact?.update?.data?.email?.toString() ?? undefined,
			});

			if (!firebaseResult.success) {
				this.logger.warn('Could not update Firebase Auth user', { error: firebaseResult.error });
			}

			const updatedContributor = await this.db.contributor.update({
				where: { id: contributorId },
				data,
			});

			return this.resultOk(updatedContributor);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not update contributor');
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
			return this.resultFail('Could not update contributor');
		}
	}

	async updateSelf(contributorId: string, data: ContributorUpdateInput): Promise<ServiceResult<Contributor>> {
		try {
			return this.applyContributorUpdate(contributorId, data);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not update contributor (self)');
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<ContributorOption[]>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const contributors = await this.db.contributor.findMany({
				where: {
					contributions: {
						some: {
							campaign: { organizationId: activeOrgResult.data.id },
						},
					},
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
			return this.resultFail('Could not fetch contributor options');
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
					contributions: {
						some: {
							campaign: { organizationId },
						},
					},
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
			return this.resultFail('Could not fetch contributors');
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
			return this.resultFail('Could not fetch contributor IDs for certificates');
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
			return this.resultFail('Could not find contributor');
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
			return this.resultFail('Could not get or create contributor from Stripe customer');
		}
	}

	async getOrCreateReferenceIdByEmail(email: string): Promise<ServiceResult<string>> {
		try {
			let referenceId: string;
			const existingContributor = await this.db.contributor.findFirst({
				where: { contact: { email: email } },
				select: { paymentReferenceId: true },
			});
			referenceId = existingContributor?.paymentReferenceId || DateTime.now().toMillis().toString();

			return this.resultOk(referenceId);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not get or generate contributor reference ID');
		}
	}

	async getOrCreateByReferenceId(contributorData: BankContributorData): Promise<ServiceResult<Contributor>> {
		try {
			const existingContributor = await this.db.contributor.findFirst({
				where: { paymentReferenceId: contributorData.paymentReferenceId },
			});
			if (existingContributor) return this.resultOk(existingContributor);

			const firebaseResult = await this.firebaseService.getOrCreateUser({
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
						},
					},
				},
				include: { contact: true },
			});
			return this.resultOk(newContributor);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not get or create contributor by reference ID');
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
			return this.resultFail('Could not find contributor by Payment Reference ID');
		}
	}

	private async createContributorWithFirebaseAuth(
		contributorData: StripeContributorData,
	): Promise<ServiceResult<ContributorWithContact>> {
		try {
			const firebaseResult = await this.firebaseService.getOrCreateUser({
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
			return this.resultFail('Could not create contributor with Firebase Auth user');
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
			return this.resultFail('Could not update contributor Stripe customer ID');
		}
	}

	async getCurrentContributorSession(firebaseAuthUserId: string): Promise<ServiceResult<ContributorSession>> {
		try {
			const contributor = await this.db.contributor.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					stripeCustomerId: true,
					contact: {
						select: {
							email: true,
							firstName: true,
							lastName: true,
							language: true,
						},
					},
				},
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			const session: ContributorSession = {
				id: contributor.id,
				email: contributor.contact?.email ?? null,
				firstName: contributor.contact?.firstName ?? null,
				lastName: contributor.contact?.lastName ?? null,
				stripeCustomerId: contributor.stripeCustomerId ?? null,
				language: contributor.contact?.language ?? null,
			};

			return this.resultOk(session);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch contributor session');
		}
	}
}
