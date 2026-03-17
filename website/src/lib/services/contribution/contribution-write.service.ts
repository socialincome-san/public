import { Contribution, ContributionStatus, PaymentEvent, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { DateTime } from 'luxon';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { ContributionFormCreateInput, ContributionFormUpdateInput } from './contribution-form-input';
import { ContributionValidationService } from './contribution-validation.service';
import {
	ContributionPayload,
	PaymentEventCreateData,
	PaymentEventCreateInput,
	StripeContributionCreateData,
} from './contribution.types';

export class ContributionWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly organizationAccessService: OrganizationAccessService,
		private readonly contributionValidationService: ContributionValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async update(userId: string, input: ContributionFormUpdateInput): Promise<ServiceResult<ContributionPayload>> {
		const validatedInputResult = this.contributionValidationService.validateUpdateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (accessResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to update contribution');
			}

			const existing = await this.db.contribution.findUnique({
				where: { id: validatedInput.id },
				select: {
					campaign: { select: { id: true, organizationId: true } },
					contributor: { select: { id: true } },
				},
			});

			if (existing?.campaign.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			const referencesResult = await this.contributionValidationService.validateReferencesExist({
				contributorId: validatedInput.contributorId,
				campaignId: validatedInput.campaignId,
			});
			if (!referencesResult.success) {
				return this.resultFail(referencesResult.error);
			}

			const campaign = await this.db.campaign.findUnique({
				where: { id: validatedInput.campaignId },
				select: { organizationId: true },
			});
			if (campaign?.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			const updateData: Prisma.ContributionUpdateInput = {
				amount: validatedInput.amount,
				currency: validatedInput.currency,
				amountChf: validatedInput.amountChf,
				feesChf: validatedInput.feesChf,
				status: validatedInput.status,
			};
			if (validatedInput.contributorId !== existing.contributor.id) {
				updateData.contributor = { connect: { id: validatedInput.contributorId } };
			}
			if (validatedInput.campaignId !== existing.campaign.id) {
				updateData.campaign = { connect: { id: validatedInput.campaignId } };
			}

			const updatedContribution = await this.db.contribution.update({
				where: { id: validatedInput.id },
				data: updateData,
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

			return this.resultFail('Could not update contribution. Please try again later.');
		}
	}

	async create(userId: string, input: ContributionFormCreateInput): Promise<ServiceResult<ContributionPayload>> {
		const validatedInputResult = this.contributionValidationService.validateCreateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (accessResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to create contribution');
			}

			const referencesResult = await this.contributionValidationService.validateReferencesExist({
				contributorId: validatedInput.contributorId,
				campaignId: validatedInput.campaignId,
			});
			if (!referencesResult.success) {
				return this.resultFail(referencesResult.error);
			}

			const campaign = await this.db.campaign.findUnique({
				where: { id: validatedInput.campaignId },
				select: { organizationId: true },
			});
			if (campaign?.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			const createData: Prisma.ContributionCreateInput = {
				amount: validatedInput.amount,
				currency: validatedInput.currency,
				amountChf: validatedInput.amountChf,
				feesChf: validatedInput.feesChf,
				status: validatedInput.status,
				contributor: { connect: { id: validatedInput.contributorId } },
				campaign: { connect: { id: validatedInput.campaignId } },
			};

			const created = await this.db.contribution.create({
				data: createData,
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

			return this.resultFail('Could not create contribution. Please try again later.');
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
