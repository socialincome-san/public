import { ContributionStatus, DonationInterval, PaymentEventType, PrismaClient } from '@/generated/prisma/client';
import { Currency } from '@/lib/types/currency';
import { CampaignService } from '../campaign/campaign.service';
import { ContributionService } from '../contribution/contribution.service';
import { PaymentEventCreateInput } from '../contribution/contribution.types';
import { ContributorService } from '../contributor/contributor.service';
import { BankContributorData } from '../contributor/contributor.types';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { BankTransferPayment } from './bank-transfer.types';

export class BankTransferService extends BaseService {
	private readonly contributorService: ContributorService;
	private readonly campaignService: CampaignService;
	private readonly contributionService: ContributionService;

	constructor(
		db: PrismaClient,
		contributorService: ContributorService,
		campaignService: CampaignService,
		contributionService: ContributionService,
	) {
		super(db);
		this.contributorService = contributorService;
		this.campaignService = campaignService;
		this.contributionService = contributionService;
	}

	async createContributionForNewOrExistingContributor(
		payment: BankTransferPayment,
		userData: BankContributorData,
	): Promise<ServiceResult<string>> {
		try {
			const contributor = await this.contributorService.getOrCreateByReferenceId(userData);

			if (!contributor.success) {
				return this.resultFail(`Could not get or create contributor for reference Id ${userData.paymentReferenceId}`);
			}

			const newContribution = await this.buildContribution(payment, contributor.data.id);
			if (!newContribution.success) {
				return this.resultFail(`Could not build new contribution for reference Id ${payment.referenceId}`);
			}
			const createdContribution = await this.contributionService.upsertFromBankTransfer(newContribution.data);
			if (!createdContribution.success) {
				return this.resultFail(`Could not generate pending contribution for reference id ${payment.referenceId}`);
			}
			return this.resultOk('Contribution created');
		} catch (error) {
			console.error('Failed to store charge', error);
			return this.resultFail(`Failed to store contribution: ${JSON.stringify(error)}`);
		}
	}

	private async buildContribution(
		payment: BankTransferPayment,
		contributorId: string,
	): Promise<ServiceResult<PaymentEventCreateInput>> {
		const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
		if (!fallbackCampaignResult.success) {
			return this.resultFail('Could not get campaign ID');
		}
		const campaignId = fallbackCampaignResult.data.id;
		const paymentEvent: PaymentEventCreateInput = {
			type: PaymentEventType.bank_transfer,
			transactionId: payment.referenceId, // this will be used as ID to find contribution in paymen file import
			metadata: {
				raw_content: '',
			},
			contribution: {
				create: {
					amount: payment.amount,
					currency: payment.currency as Currency,
					amountChf: payment.amount,
					feesChf: 0,
					interval: this.getDonationInterval(payment.interval),
					status: ContributionStatus.pending,
					campaign: {
						connect: {
							id: campaignId,
						},
					},
					contributor: {
						connect: { id: contributorId },
					},
				},
			},
		};

		return this.resultOk(paymentEvent);
	}

	private getDonationInterval(interval: number): DonationInterval | null {
		switch (interval) {
			case 1:
				return DonationInterval.monthly;
			case 3:
				return DonationInterval.quarterly;
			case 12:
				return DonationInterval.yearly;

			default:
				return null;
		}
	}
}
