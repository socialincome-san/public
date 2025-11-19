import { ContributionStatus, PaymentEventType } from '@prisma/client';
import { CampaignService } from '../database/services/campaign/campaign.service';
import { ContributionService } from '../database/services/contribution/contribution.service';
import { PaymentEventCreateInput } from '../database/services/contribution/contribution.types';
import { ContributorService } from '../database/services/contributor/contributor.service';
import { BankContributorData } from '../database/services/contributor/contributor.types';
import { Currency } from '../types/currency';

export type BankTransferPayment = {
	amount: number;
	currency: Currency;
	referenceId: string;
};

export class BankTransferService {
	private contributorService = new ContributorService();
	private campaignService = new CampaignService();
	private contributionService = new ContributionService();

	async storeContributionForNewOrExistingContributor(payment: BankTransferPayment, userData: BankContributorData) {
		try {
			const contributor = await this.contributorService.getOrCreateByReferenceId(
				userData.paymentReferenceId.toString(),
				userData,
			);

			if (!contributor.success) {
				// TODO:
				return;
			}

			const newContribution = await this.buildContribution(payment, contributor.data.id);
			const createdContribution = await this.contributionService.createContributionWithPaymentEvent(newContribution);
			if (!createdContribution.success) {
				// TODO:
				return;
			}
			return;
		} catch (error) {
			console.error('Failed to store charge', error);
			throw error;
		}
	}

	private async buildContribution(
		payment: BankTransferPayment,
		contributorId: string,
	): Promise<PaymentEventCreateInput> {
		const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
		if (!fallbackCampaignResult.success) {
			// TODO:
			return {};
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

		return paymentEvent;
	}
}
