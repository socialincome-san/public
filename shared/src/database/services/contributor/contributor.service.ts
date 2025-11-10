import { Contributor } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseService } from '../firebase/firebase.service';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	ContributorOption,
	ContributorPayload,
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
			console.error(error);
			return this.resultFail('Could not get contributor');
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

			const existing = await this.db.contributor.findUnique({
				where: { id: contributor.id?.toString() },
				select: { account: true },
			});

			if (!existing) {
				return this.resultFail('Contributor not found');
			}

			if (!contributor.contact?.update?.data?.email) {
				return this.resultFail('Contributor email is required');
			}

			const firebaseResult = await this.firebaseService.updateByUid(existing.account.firebaseAuthUserId, {
				email: contributor.contact?.update?.data?.email?.toString() ?? undefined,
			});
			if (!firebaseResult.success) {
				// for now, dont fail the update if firebase user cannot be updated, because there is no auth user for every contributor
				console.warn('Could not update Firebase Auth user for contributor:', firebaseResult.error);
			}

			const updatedContributor = await this.db.contributor.update({
				where: { id: contributor.id?.toString() },
				data: contributor,
			});

			return this.resultOk(updatedContributor);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not update contributor');
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
			console.error(error);
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
			console.error(error);
			return this.resultFail('Could not fetch contributors');
		}
	}

	async findByStripeCustomerId(stripeCustomerId: string): Promise<ServiceResult<ContributorWithContact>> {
		try {
			const contributor = await this.db.contributor.findFirst({
				where: { stripeCustomerId },
				include: { contact: true },
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			return this.resultOk(contributor);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not find contributor by Stripe customer ID');
		}
	}

	async findByEmail(email: string): Promise<ServiceResult<ContributorWithContact>> {
		try {
			const contributor = await this.db.contributor.findFirst({
				where: {
					contact: { email },
				},
				include: { contact: true },
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			return this.resultOk(contributor);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not find contributor by email');
		}
	}

	async createFromStripeCustomer(
		contributorData: StripeContributorData,
	): Promise<ServiceResult<ContributorWithContact>> {
		try {
			const firebaseResult = await this.firebaseService.createUser({
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
			console.error(error);
			return this.resultFail('Could not create contributor from Stripe customer');
		}
	}

	/**
	 * Update contributor's Stripe customer ID
	 */
	async updateStripeCustomerId(contributorId: string, stripeCustomerId: string): Promise<ServiceResult<void>> {
		try {
			await this.db.contributor.update({
				where: { id: contributorId },
				data: { stripeCustomerId },
			});

			return this.resultOk(undefined);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not update contributor Stripe customer ID');
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
			console.error(error);
			return this.resultFail('Could not find contributor');
		}
	}
}
