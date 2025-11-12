/**
 * TESTING GUIDE:
 * 1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
 * 2. Login to Stripe: `stripe login`
 * 3. Forward webhooks to local endpoint:
 *    `stripe listen --forward-to localhost:3001/api/portal/v1/stripe/webhook`
 * 4. Copy the webhook signing secret from CLI output and set in your env.local:
 *    STRIPE_WEBHOOK_SECRET=whsec_xxx...
 * 5. Make a test contribution - webhooks will be forwarded to your local server.
 */

import { ContributionStatus, ContributorReferralSource, PaymentEventType } from '@prisma/client';
import Stripe from 'stripe';
import { CampaignService } from '../campaign/campaign.service';
import { ContributionService } from '../contribution/contribution.service';
import { PaymentEventCreateData, StripeContributionCreateData } from '../contribution/contribution.types';
import { ContributorService } from '../contributor/contributor.service';
import { StripeContributorData } from '../contributor/contributor.types';
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
		signature: string,
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
					this.logger.info('Processing charge event', { eventType: event.type, chargeId: charge.id });

					const result = await this.processChargeEvent(charge);

					if (!result.success) {
						this.logger.error(result.error);
						return this.resultFail(result.error);
					}

					if (result.data.contributionId) {
						this.logger.info('Successfully processed charge', { chargeId: charge.id });
					}
					return this.resultOk(result.data);
				}
				default:
					return this.resultOk({ skipReason: `Unhandled event type: ${event.type}` });
			}
		} catch (error) {
			this.logger.error(error);
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

			// Extract campaign ID from checkout session metadata
			const checkoutMetadata = await this.getCheckoutMetadata(fullCharge);

			let contributor;
			let isNewContributor = false;

			if (fullCharge.status === 'succeeded') {
				// For successful payments: get or create contributor
				const { firstName, lastName } = this.splitName(stripeCustomer.name);
				const contributorData: StripeContributorData = {
					stripeCustomerId: stripeCustomer.id,
					email: stripeCustomer.email,
					firstName,
					lastName,
					referral: ContributorReferralSource.other,
				};

				const contributorResult = await this.contributorService.getOrCreateContributorWithFirebaseAuth(contributorData);
				if (!contributorResult.success) {
					this.logger.error(contributorResult.error);
					return this.resultFail(contributorResult.error);
				}

				contributor = contributorResult.data.contributor;
				isNewContributor = contributorResult.data.isNewContributor;

				if (isNewContributor) {
					this.logger.info('Created new contributor', { contributorId: contributor.id });
				}
			} else {
				// For failed/pending payments: only process if contributor already exists
				const existingContributorResult = await this.contributorService.findByStripeCustomerOrEmail(
					stripeCustomer.id,
					stripeCustomer.email || undefined,
				);

				if (!existingContributorResult.success) {
					this.logger.error(existingContributorResult.error);
					return this.resultFail(existingContributorResult.error);
				}

				if (!existingContributorResult.data) {
					this.logger.info(`Skipping non-successful charge for non-existent contributor`);
					return this.resultOk({ skipReason: 'Non-successful charge with no existing contributor' });
				}

				contributor = existingContributorResult.data;
				isNewContributor = false;
			}

			// Use fallback campaign if no specific campaign was selected
			let campaignId = checkoutMetadata?.campaignId;
			if (!campaignId) {
				const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
				if (!fallbackCampaignResult.success) {
					this.logger.error(fallbackCampaignResult.error);
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

			// Create or update contribution with associated payment event (upsert based on transactionId)
			const contributionResult = await this.contributionService.upsertFromStripeEvent(
				contributionData,
				paymentEventData,
			);

			if (!contributionResult.success) {
				this.logger.error(contributionResult.error);
				return this.resultFail(contributionResult.error);
			}

			this.logger.info('Created contribution', { contributionId: contributionResult.data.id });
			return this.resultOk({
				contributionId: contributionResult.data.id,
				contributorId: contributor.id,
				isNewContributor,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Failed to process charge');
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
