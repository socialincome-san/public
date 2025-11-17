import { Contribution } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	ContributionDonationEntry,
	ContributionPayload,
	ContributionTableView,
	ContributionTableViewRow,
	ContributionUpdateInput,
	PaymentEventCreateData,
	StripeContributionCreateData,
} from './contribution.types';

export class ContributionService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	async get(userId: string, contributionId: string): Promise<ServiceResult<ContributionPayload>> {
		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const contribution = await this.db.contribution.findUnique({
				where: {
					id: contributionId,
				},
				select: {
					id: true,
					amount: true,
					currency: true,
					amountChf: true,
					feesChf: true,
					status: true,
					contributor: {
						select: {
							id: true,
						},
					},
					campaign: {
						select: {
							id: true,
							organizationId: true,
						},
					},
				},
			});

			if (!contribution) {
				return this.resultFail('Contribution not found');
			}

			if (contribution.campaign.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			// convert decimal fields to number
			return this.resultOk({
				...contribution,
				amount: Number(contribution.amount),
				amountChf: Number(contribution.amount),
				feesChf: Number(contribution.amount),
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch contribution');
		}
	}

	async update(userId: string, contribution: ContributionUpdateInput): Promise<ServiceResult<Contribution>> {
		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (accessResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to create campaign');
			}

			const existing = await this.db.contribution.findUnique({
				where: { id: contribution.id?.toString() },
				select: {
					campaign: { select: { organizationId: true } },
				},
			});

			if (!existing || existing.campaign.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			const updatedContribution = await this.db.contribution.update({
				where: { id: contribution.id?.toString() },
				data: contribution,
			});

			return this.resultOk(updatedContribution);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not update contribution');
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<ContributionTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;

			const contributions = await this.db.contribution.findMany({
				where: {
					campaign: {
						organizationId,
					},
				},
				select: {
					id: true,
					createdAt: true,
					amount: true,
					currency: true,
					campaign: {
						select: {
							title: true,
							program: { select: { name: true } },
						},
					},
					contributor: {
						select: {
							contact: {
								select: {
									firstName: true,
									lastName: true,
									email: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: ContributionTableViewRow[] = contributions.map((c) => ({
				id: c.id,
				firstName: c.contributor?.contact?.firstName ?? '',
				lastName: c.contributor?.contact?.lastName ?? '',
				email: c.contributor?.contact?.email ?? '',
				amount: c.amount ? Number(c.amount) : 0,
				currency: c.currency ?? '',
				campaignTitle: c.campaign?.title ?? '',
				programName: c.campaign?.program?.name ?? null,
				createdAt: c.createdAt,
			}));

			return this.resultOk({ tableRows, permission: permission });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch contributions');
		}
	}

	async getForContributorsAndYear(
		contributorsIds: string[],
		year: number,
	): Promise<ServiceResult<ContributionDonationEntry[]>> {
		try {
			const result = await this.db.contribution.findMany({
				where: {
					contributorId: { in: contributorsIds },
					AND: [
						{ createdAt: { gte: new Date(`${year}-01-01 00:00:00`) } },
						{ createdAt: { lte: new Date(`${year}-12-31 23:59:59`) } },
					],
				},
				select: {
					contributorId: true,
					amount: true,
					currency: true,
					amountChf: true,
					feesChf: true,
					status: true,
					createdAt: true,
				},
			});

			const contributions = result.map((r) => ({
				contributorId: r.contributorId,
				amount: Number(r.amount),
				currency: r.currency,
				amountChf: Number(r.amountChf),
				feesChf: Number(r.feesChf),
				status: r.status,
				createdAt: r.createdAt,
			}));

			return this.resultOk(contributions);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch contributions for contributors ${contributorsIds.join(', ')}`);
		}
	}

	async upsertFromStripeEvent(
		contributionData: StripeContributionCreateData,
		paymentEventData: PaymentEventCreateData,
	): Promise<ServiceResult<Contribution>> {
		try {
			const paymentEvent = await this.db.paymentEvent.upsert({
				where: { transactionId: paymentEventData.transactionId },
				create: {
					...paymentEventData,
					metadata: paymentEventData.metadata as object,
					contribution: {
						create: contributionData,
					},
				},
				update: {
					...paymentEventData,
					metadata: paymentEventData.metadata as object,
					contribution: {
						update: contributionData,
					},
				},
				include: {
					contribution: true,
				},
			});

			return this.resultOk(paymentEvent.contribution);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not create or update contribution from Stripe event');
		}
	}
}
