import { Contribution, ContributionStatus, PaymentEvent, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { DateTime } from 'luxon';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	ContributionCreateInput,
	ContributionPayload,
	ContributionUpdateInput,
	PaymentEventCreateData,
	PaymentEventCreateInput,
	StripeContributionCreateData,
} from './contribution.types';

export class ContributionWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly organizationAccessService: OrganizationAccessService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async update(userId: string, contribution: ContributionUpdateInput): Promise<ServiceResult<ContributionPayload>> {
		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (accessResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to update contribution');
			}

			const contributionId = typeof contribution.id === 'string' ? contribution.id : undefined;
			if (!contributionId) {
				return this.resultFail('Contribution ID is required');
			}

			const existing = await this.db.contribution.findUnique({
				where: { id: contributionId },
				select: {
					campaign: { select: { organizationId: true } },
				},
			});

			if (!existing || existing.campaign.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			const updatedContribution = await this.db.contribution.update({
				where: { id: contributionId },
				data: contribution,
				select: {
					id: true,
					amount: true,
					currency: true,
					amountChf: true,
					feesChf: true,
					status: true,
					contributor: { select: { id: true } },
					campaign: { select: { id: true } },
				},
			});

			return this.resultOk({
				...updatedContribution,
				amount: Number(updatedContribution.amount),
				amountChf: Number(updatedContribution.amountChf),
				feesChf: Number(updatedContribution.feesChf),
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update contribution: ${JSON.stringify(error)}`);
		}
	}

	async create(userId: string, contribution: ContributionCreateInput): Promise<ServiceResult<ContributionPayload>> {
		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (accessResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to create contribution');
			}

			const created = await this.db.contribution.create({
				data: contribution,
				select: {
					id: true,
					amount: true,
					currency: true,
					amountChf: true,
					feesChf: true,
					status: true,
					contributor: { select: { id: true } },
					campaign: { select: { id: true } },
				},
			});

			return this.resultOk({
				...created,
				amount: Number(created.amount),
				amountChf: Number(created.amountChf),
				feesChf: Number(created.feesChf),
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create contribution: ${JSON.stringify(error)}`);
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

			return this.resultFail(`Could not create or update contribution from Stripe event: ${JSON.stringify(error)}`);
		}
	}

	async upsertFromBankTransfer(paymentEvent: PaymentEventCreateInput): Promise<ServiceResult<PaymentEvent>> {
		try {
			const existing = await this.db.paymentEvent.findUnique({
				where: { transactionId: paymentEvent.transactionId },
				select: { id: true, contribution: { select: { status: true } } },
			});
			let result;

			if (existing?.contribution?.status === ContributionStatus.pending) {
				result = await this.db.paymentEvent.update({
					where: { id: existing.id },
					data: {
						...paymentEvent,
						contribution: {
							update: {
								...paymentEvent.contribution.create,
							},
						},
					},
				});
			} else if (existing) {
				result = await this.db.paymentEvent.create({
					data: {
						...paymentEvent,
						transactionId: paymentEvent.transactionId + `-${DateTime.now().toMillis().toString()}`,
					},
				});
			} else {
				result = await this.db.paymentEvent.create({
					data: paymentEvent,
				});
			}

			return this.resultOk(result);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create payment events with contributions: ${JSON.stringify(error)}`);
		}
	}
}
