import { ContributionStatus, ContributorReferralSource, PaymentEventType } from '@prisma/client';
import Stripe from 'stripe';
import { CampaignService } from '../campaign/campaign.service';
import { ContributionService } from '../contribution/contribution.service';
import { PaymentEventCreateData, StripeContributionCreateData } from '../contribution/contribution.types';
import { ContributorService } from '../contributor/contributor.service';
import { ContributorWithContact, StripeContributorData } from '../contributor/contributor.types';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CheckoutMetadata, StripeCustomerData, WebhookResult } from './stripe.types';

export class StripeService extends BaseService {
	private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
	private readonly contributorService = new ContributorService();
	private readonly contributionService = new ContributionService();
	private readonly campaignService = new CampaignService();

	async handleWebhookEvent(
		body: Buffer,
		signature: string | string[],
		webhookSecret: string,
	): Promise<ServiceResult<WebhookResult>> {
		try {
			console.log('🔄 Processing Stripe webhook event...');
			const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
			console.log(`📨 Received Stripe event: ${event.type} (${event.id})`);

			if (event.type !== 'charge.succeeded') {
				console.log(`⏭️  Skipping event type: ${event.type}`);
				return this.resultOk({});
			}

			const charge = event.data.object as Stripe.Charge;
			console.log(`💳 Processing charge: ${charge.id} for ${charge.amount / 100} ${charge.currency.toUpperCase()}`);

			const result = await this.processChargeSucceeded(charge);

			if (!result.success) {
				console.error(`❌ Failed to process charge ${charge.id}:`, result.error);
				return this.resultFail(result.error);
			}

			console.log(`✅ Successfully processed charge ${charge.id}:`, result.data);
			return this.resultOk(result.data);
		} catch (error) {
			console.error('❌ Error handling webhook event:', error);
			return this.resultFail('Failed to handle webhook event');
		}
	}

	private async processChargeSucceeded(charge: Stripe.Charge): Promise<ServiceResult<WebhookResult>> {
		try {
			const fullCharge = await this.stripe.charges.retrieve(charge.id, {
				expand: ['balance_transaction', 'invoice'],
			});

			const stripeCustomer = await this.retrieveStripeCustomer(fullCharge.customer as string);
			console.log(`👤 Retrieved customer: ${stripeCustomer.email} (${stripeCustomer.id})`);

			const checkoutMetadata = await this.getCheckoutMetadata(fullCharge);
			console.log('📋 Checkout metadata:', checkoutMetadata);

			const contributorResult = await this.getOrCreateContributor(stripeCustomer);
			if (!contributorResult.success) {
				console.error('❌ Failed to get/create contributor:', contributorResult.error);
				return this.resultFail(contributorResult.error);
			}

			const { contributor, isNewContributor } = contributorResult.data;
			console.log(`👥 ${isNewContributor ? 'Created new' : 'Found existing'} contributor: ${contributor.id}`);

			let campaignId = checkoutMetadata?.campaignId;
			if (!campaignId) {
				console.log('🔄 No campaign ID in metadata, using fallback campaign...');
				const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
				if (!fallbackCampaignResult.success) {
					console.error('❌ Failed to get fallback campaign:', fallbackCampaignResult.error);
					return this.resultFail(fallbackCampaignResult.error);
				}
				campaignId = fallbackCampaignResult.data.id;
				console.log(`📊 Using fallback campaign: ${campaignId}`);
			} else {
				console.log(`📊 Using campaign from metadata: ${campaignId}`);
			}

			const contributionData: StripeContributionCreateData = {
				contributorId: contributor.id,
				amount: fullCharge.amount / 100,
				currency: fullCharge.currency.toUpperCase(),
				amountChf: this.extractAmountChf(fullCharge),
				feesChf: this.extractFeesChf(fullCharge),
				status: this.constructStatus(fullCharge.status),
				campaignId,
				createdAt: new Date(fullCharge.created * 1000),
			};

			const paymentEventData: PaymentEventCreateData = {
				type: PaymentEventType.stripe,
				transactionId: fullCharge.id,
				metadata: {
					chargeId: fullCharge.id,
					customerId: fullCharge.customer,
					paymentIntentId: fullCharge.payment_intent,
					balanceTransactionId: (fullCharge.balance_transaction as Stripe.BalanceTransaction)?.id,
				},
			};

			console.log('💾 Creating contribution with payment event...');
			const contributionResult = await this.contributionService.createWithPaymentEvent(
				contributionData,
				paymentEventData,
			);

			if (!contributionResult.success) {
				console.error('❌ Failed to create contribution:', contributionResult.error);
				return this.resultFail(contributionResult.error);
			}

			console.log(`✅ Created contribution: ${contributionResult.data.id}`);
			return this.resultOk({
				contributionId: contributionResult.data.id,
				contributorId: contributor.id,
				isNewContributor,
			});
		} catch (error) {
			console.error('Error processing charge:', error);
			return this.resultFail('Failed to process charge');
		}
	}

	private async getOrCreateContributor(
		stripeCustomer: StripeCustomerData,
	): Promise<ServiceResult<{ contributor: ContributorWithContact; isNewContributor: boolean }>> {
		try {
			const existingResult = await this.contributorService.findByStripeCustomerOrEmail(
				stripeCustomer.id,
				stripeCustomer.email || undefined,
			);

			if (!existingResult.success) {
				return this.resultFail(existingResult.error);
			}

			if (existingResult.data) {
				console.log(`👤 Found existing contributor: ${existingResult.data.id}`);
				if (!existingResult.data.stripeCustomerId) {
					console.log('🔄 Updating contributor with Stripe customer ID...');
					await this.contributorService.updateStripeCustomerId(existingResult.data.id, stripeCustomer.id);
				}
				return this.resultOk({ contributor: existingResult.data, isNewContributor: false });
			}

			const { firstName, lastName } = this.splitName(stripeCustomer.name);
			console.log(`👤 Creating new contributor: ${firstName} ${lastName} (${stripeCustomer.email})`);

			const contributorData: StripeContributorData = {
				stripeCustomerId: stripeCustomer.id,
				email: stripeCustomer.email || '',
				firstName,
				lastName,
				referral: ContributorReferralSource.other,
			};

			const createResult = await this.contributorService.createFromStripeCustomer(contributorData);
			if (!createResult.success) {
				console.error('❌ Failed to create contributor:', createResult.error);
				return this.resultFail(createResult.error);
			}

			console.log(`✅ Created new contributor: ${createResult.data.id}`);
			return this.resultOk({ contributor: createResult.data, isNewContributor: true });
		} catch (error) {
			console.error('Error getting or creating contributor:', error);
			return this.resultFail('Failed to get or create contributor');
		}
	}

	private extractAmountChf(charge: Stripe.Charge): number {
		const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;
		return balanceTransaction?.amount ? balanceTransaction.amount / 100 : 0;
	}

	private extractFeesChf(charge: Stripe.Charge): number {
		const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;
		return balanceTransaction?.fee ? balanceTransaction.fee / 100 : 0;
	}

	private async retrieveStripeCustomer(customerId: string): Promise<StripeCustomerData> {
		const customer = await this.stripe.customers.retrieve(customerId);
		if (customer.deleted) {
			throw new Error(`Deleted Stripe customer: ${customerId}`);
		}
		return customer as StripeCustomerData;
	}

	private async getCheckoutMetadata(charge: Stripe.Charge): Promise<CheckoutMetadata | null> {
		const paymentIntentId = charge.payment_intent;
		if (!paymentIntentId) {
			return null;
		}

		const sessions = await this.stripe.checkout.sessions.list({
			payment_intent: paymentIntentId.toString(),
		});

		const session = sessions.data.length > 0 ? sessions.data[0] : null;
		return session?.metadata || null;
	}

	private constructStatus(status: Stripe.Charge.Status): ContributionStatus {
		switch (status) {
			case 'succeeded':
				return ContributionStatus.succeeded;
			case 'pending':
				return ContributionStatus.pending;
			case 'failed':
				return ContributionStatus.failed;
			default:
				return ContributionStatus.failed;
		}
	}

	private splitName(fullName?: string | null): { firstName: string; lastName: string } {
		if (!fullName) {
			return { firstName: 'Unknown', lastName: '' };
		}

		const parts = fullName.trim().split(' ');
		if (parts.length === 1) {
			return { firstName: parts[0], lastName: '' };
		}

		const firstName = parts[0];
		const lastName = parts.slice(1).join(' ');
		return { firstName, lastName };
	}
}
