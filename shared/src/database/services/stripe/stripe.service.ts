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
			// Verify webhook signature and parse event
			const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

			switch (event.type) {
				case 'charge.succeeded':
				case 'charge.updated': // For final balance_transaction updates
				case 'charge.failed': {
					const charge = event.data.object as Stripe.Charge;
					console.log(`Processing charge event ${event.type}: ${charge.id}`);

					const result = await this.processChargeEvent(charge);

					if (!result.success) {
						console.error(`Failed to process charge ${charge.id}:`, result.error);
						return this.resultFail(result.error);
					}

					if (result.data.contributionId) {
						console.log(`Successfully processed charge: ${charge.id}`);
					}
					return this.resultOk(result.data);
				}
				default:
					return this.resultOk({ skipReason: `Unhandled event type: ${event.type}` });
			}
		} catch (error) {
			console.error('Error handling webhook event:', error);
			return this.resultFail('Failed to handle webhook event');
		}
	}

	private async processChargeEvent(charge: Stripe.Charge): Promise<ServiceResult<WebhookResult>> {
		try {
			// Get full charge details with expanded balance_transaction for fees
			const fullCharge = await this.stripe.charges.retrieve(charge.id, {
				expand: ['balance_transaction', 'invoice'],
			});

			const stripeCustomer = await this.retrieveStripeCustomer(fullCharge.customer as string);
			
			// Business rule: only store failed/pending charges if contributor already exists
			// This prevents creating database entries for users who never successfully contributed
			const existingContributorResult = await this.contributorService.findByStripeCustomerOrEmail(
				stripeCustomer.id,
				stripeCustomer.email || undefined,
			);

			if (!existingContributorResult.success) {
				console.error('Failed to check existing contributor:', existingContributorResult.error);
				return this.resultFail(existingContributorResult.error);
			}

			const existingContributor = existingContributorResult.data;
			
			// Skip non-successful charges for new users
			if (fullCharge.status !== 'succeeded' && !existingContributor) {
				return this.resultOk({ skipReason: 'Non-successful charge with no existing contributor' });
			}

			// Extract campaign ID from checkout session metadata
			const checkoutMetadata = await this.getCheckoutMetadata(fullCharge);
			
			const contributorResult = await this.getOrCreateContributor(stripeCustomer);
			if (!contributorResult.success) {
				console.error('Failed to get/create contributor:', contributorResult.error);
				return this.resultFail(contributorResult.error);
			}

			const { contributor, isNewContributor } = contributorResult.data;

			// Use fallback campaign if no specific campaign was selected
			let campaignId = checkoutMetadata?.campaignId;
			if (!campaignId) {
				const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
				if (!fallbackCampaignResult.success) {
					console.error('Failed to get fallback campaign:', fallbackCampaignResult.error);
					return this.resultFail(fallbackCampaignResult.error);
				}
				campaignId = fallbackCampaignResult.data.id;
			}

			// Prepare contribution data with CHF amounts from balance_transaction
			const contributionData: StripeContributionCreateData = {
				contributorId: contributor.id,
				amount: fullCharge.amount / 100, // Original charge amount
				currency: fullCharge.currency.toUpperCase(),
				amountChf: this.extractAmountChf(fullCharge), // Final settled amount in CHF
				feesChf: this.extractFeesChf(fullCharge), // Stripe processing fees
				status: this.constructStatus(fullCharge.status),
				campaignId,
				createdAt: new Date(fullCharge.created * 1000),
			};

			// Store payment metadata for audit trail
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

			// Create contribution with associated payment event
			const contributionResult = await this.contributionService.createWithPaymentEvent(
				contributionData,
				paymentEventData,
			);

			if (!contributionResult.success) {
				console.error('Failed to create contribution:', contributionResult.error);
				return this.resultFail(contributionResult.error);
			}

			console.log(`Created contribution: ${contributionResult.data.id}`);
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
			// Try to find existing contributor by Stripe ID or email
			const existingResult = await this.contributorService.findByStripeCustomerOrEmail(
				stripeCustomer.id,
				stripeCustomer.email || undefined,
			);

			if (!existingResult.success) {
				return this.resultFail(existingResult.error);
			}

			if (existingResult.data) {
				// Link Stripe customer ID if missing (for existing email-matched users)
				if (!existingResult.data.stripeCustomerId) {
					await this.contributorService.updateStripeCustomerId(existingResult.data.id, stripeCustomer.id);
				}
				return this.resultOk({ contributor: existingResult.data, isNewContributor: false });
			}

			// Create new contributor with parsed name
			const { firstName, lastName } = this.splitName(stripeCustomer.name);

			const contributorData: StripeContributorData = {
				stripeCustomerId: stripeCustomer.id,
				email: stripeCustomer.email || '',
				firstName,
				lastName,
				referral: ContributorReferralSource.other,
			};

			const createResult = await this.contributorService.createFromStripeCustomer(contributorData);
			if (!createResult.success) {
				console.error('Failed to create contributor:', createResult.error);
				return this.resultFail(createResult.error);
			}

			console.log(`Created new contributor: ${createResult.data.id}`);
			return this.resultOk({ contributor: createResult.data, isNewContributor: true });
		} catch (error) {
			console.error('Error getting or creating contributor:', error);
			return this.resultFail('Failed to get or create contributor');
		}
	}

	private extractAmountChf(charge: Stripe.Charge): number {
		// Extract final settled amount in CHF from balance_transaction
		const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;
		return balanceTransaction?.amount ? balanceTransaction.amount / 100 : 0;
	}

	private extractFeesChf(charge: Stripe.Charge): number {
		// Extract Stripe processing fees in CHF from balance_transaction
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
		// Retrieve campaign ID and other metadata from the original checkout session
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
		// Parse Stripe customer name into first and last name components
		if (!fullName) {
			return { firstName: 'Unknown', lastName: '' };
		}

		const parts = fullName.trim().split(' ');
		if (parts.length === 1) {
			return { firstName: parts[0], lastName: '' };
		}

		const firstName = parts[0];
		const lastName = parts.slice(1).join(' '); // Handle multiple middle/last names
		return { firstName, lastName };
	}
}
