/**
 * TESTING GUIDE:
 * 1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
 * 2. Login to Stripe: `stripe login`
 * 3. Forward webhooks to local endpoint:
 *    `stripe listen --forward-to localhost:3000/api/v1/stripe/webhook`
 * 4. Copy the webhook signing secret from CLI output and set in your env.local:
 *    STRIPE_WEBHOOK_SECRET=whsec_xxx...
 * 5. Make a test contribution - webhooks will be forwarded to your local server.
 */

import { ContributionStatus, ContributorReferralSource, PaymentEventType } from '@/generated/prisma/client';
import { titleCase } from '@/lib/utils/string-utils';
import Stripe from 'stripe';
import { CampaignService } from '../campaign/campaign.service';
import { ContributionService } from '../contribution/contribution.service';
import { ProgramAccessService } from '../program-access/program-access.service';
import { PaymentEventCreateData, StripeContributionCreateData } from '../contribution/contribution.types';
import { ContributorService } from '../contributor/contributor.service';
import { ContributorUpdateInput, ContributorWithContact, StripeContributorData } from '../contributor/contributor.types';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	CheckoutMetadata,
	StripeCustomerData,
	StripePaymentMethod,
	StripeSubscriptionRow,
	StripeSubscriptionTableView,
	UpdateContributorAfterCheckoutInput,
	WebhookResult,
} from './stripe.types';
export class StripeService extends BaseService {
	private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
	private readonly contributorService = new ContributorService();
	private readonly contributionService = new ContributionService();
	private readonly campaignService = new CampaignService();
	private readonly programAccessService = new ProgramAccessService();

	async handleWebhookEvent(
		body: string,
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
			return this.resultFail(`Failed to handle webhook event: ${JSON.stringify(error)}`);
		}
	}

	private async processChargeEvent(charge: Stripe.Charge): Promise<ServiceResult<WebhookResult>> {
		try {
			// Get full charge details with expanded balance_transaction for fees
			const fullCharge = await this.stripe.charges.retrieve(charge.id, {
				expand: ['balance_transaction', 'invoice'],
			});

			const stripeCustomer = await this.retrieveStripeCustomer(fullCharge.customer as string);

			// Extract campaign ID and optional accountId (portal flow) from checkout session metadata
			const checkoutMetadata = await this.getCheckoutMetadata(fullCharge);

			let contributor: ContributorWithContact | undefined;
			let isNewContributor = false;

			// Portal flow: metadata has accountId (logged-in user donating from portal)
			const accountId = checkoutMetadata?.accountId as string | undefined;
			if (accountId) {
				const user = await this.db.user.findUnique({
					where: { accountId },
					select: { contactId: true },
				});
				if (user) {
					const portalResult = await this.contributorService.getOrCreateContributorForAccount(
						accountId,
						stripeCustomer.id,
						user.contactId,
					);
					if (!portalResult.success) {
						this.logger.error(portalResult.error);
						return this.resultFail(portalResult.error);
					}
					contributor = portalResult.data.contributor;
					isNewContributor = portalResult.data.isNewContributor;
					if (isNewContributor) {
						this.logger.info('Created new contributor (portal)', { contributorId: contributor.id });
					}
				}
			}

			if (!contributor) {
				// Public flow: get or create contributor by Stripe customer / email
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

					const contributorResult = await this.contributorService.getOrCreateContributorWithFirebaseAuth(
						contributorData,
					);
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
			return this.resultFail(`Failed to process charge: ${JSON.stringify(error)}`);
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

	async getSubscriptionsTableView(
		stripeCustomerId: string | null,
	): Promise<ServiceResult<StripeSubscriptionTableView>> {
		try {
			if (!stripeCustomerId) {
				return this.resultOk({ rows: [] });
			}

			const subscriptions = await this.stripe.subscriptions.list({
				customer: stripeCustomerId,
				status: 'all',
			});

			const rows: StripeSubscriptionRow[] = await Promise.all(
				subscriptions.data.map(async (sub) => {
					const item = sub.items.data[0];
					const price = item?.price;

					const amount = price?.unit_amount ? price.unit_amount / 100 : 0;
					const currency = price?.currency?.toUpperCase() ?? '';
					const interval = price?.recurring?.interval_count?.toString() ?? '';

					const method = await this.stripe.paymentMethods.retrieve(sub.default_payment_method?.toString() ?? '');

					return {
						id: sub.id,
						created: new Date(sub.start_date * 1000),
						status: sub.status,
						amount,
						interval,
						currency,
						paymentMethod: this.getPaymentMethod(method),
					};
				}),
			);

			return this.resultOk({ rows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch subscriptions: ${JSON.stringify(error)}`);
		}
	}

	private getPaymentMethod(paymentMethod: Stripe.PaymentMethod): StripePaymentMethod {
		if (paymentMethod.type === 'card' && paymentMethod.card) {
			return {
				type: 'card',
				label: titleCase(paymentMethod.card.brand),
			};
		}
		return {
			type: 'other',
			label: titleCase(paymentMethod.type),
		};
	}

	async createManageSubscriptionsSession(
		stripeCustomerId: string | null,
		language: string | null,
	): Promise<ServiceResult<string>> {
		try {
			if (!stripeCustomerId) {
				return this.resultFail('Missing Stripe customer ID');
			}

			const session = await this.stripe.billingPortal.sessions.create({
				customer: stripeCustomerId,
				return_url: `${process.env.BASE_URL}/dashboard/subscriptions`,
				locale: (language as Stripe.BillingPortal.SessionCreateParams.Locale) ?? 'auto',
			});

			if (!session.url) {
				return this.resultFail('No billing portal URL returned');
			}

			return this.resultOk(session.url);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create billing portal session: ${JSON.stringify(error)}`);
		}
	}

	async createCheckoutSession(data: {
		amount: number;
		successUrl: string;
		recurring?: boolean;
		currency?: string;
		intervalCount?: number;
		stripeCustomerId?: string | null;
		campaignId?: string;
		accountId?: string;
		source?: string;
	}): Promise<ServiceResult<string>> {
		try {
			const {
				amount,
				currency = 'USD',
				intervalCount = 1,
				successUrl,
				recurring = false,
				stripeCustomerId,
				campaignId,
				accountId,
				source,
			} = data;

			const metadata: Record<string, string> = {};
			if (campaignId) metadata.campaignId = campaignId;
			if (accountId) metadata.accountId = accountId;
			if (source) metadata.source = source;

			const price = await this.stripe.prices.create({
				active: true,
				unit_amount: amount,
				currency: currency.toLowerCase(),
				product: recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME,
				recurring: recurring ? { interval: 'month', interval_count: intervalCount } : undefined,
			});

			const session = await this.stripe.checkout.sessions.create({
				mode: recurring ? 'subscription' : 'payment',

				customer: stripeCustomerId || undefined,
				customer_creation: stripeCustomerId ? undefined : recurring ? undefined : 'always',
				line_items: [
					{
						price: price.id,
						quantity: 1,
					},
				],
				success_url: successUrl,
				locale: 'auto',

				...(Object.keys(metadata).length > 0 && { metadata }),

				...(recurring &&
					campaignId && {
						subscription_data: {
							metadata: { campaignId },
						},
					}),
			});

			return this.resultOk(session.url ?? '');
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create Stripe checkout session: ${JSON.stringify(error)}`);
		}
	}

	async createPortalProgramDonationCheckout(
		userId: string,
		input: {
			amount: number;
			programId: string;
			currency?: string;
			intervalCount?: number;
			recurring?: boolean;
		},
	): Promise<ServiceResult<string>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
		if (!accessResult.success || !accessResult.data.some((p) => p.programId === input.programId)) {
			return this.resultFail('Program not found or access denied');
		}

		const user = await this.db.user.findUnique({
			where: { id: userId },
			select: {
				accountId: true,
				contactId: true,
				contact: {
					select: { id: true, email: true, firstName: true, lastName: true },
				},
			},
		});
		if (!user) {
			return this.resultFail('User account not found');
		}

		let stripeCustomerId: string | null = null;
		const contributor = await this.db.contributor.findUnique({
			where: { accountId: user.accountId },
			select: { stripeCustomerId: true },
		});

		if (contributor?.stripeCustomerId) {
			stripeCustomerId = contributor.stripeCustomerId;
		} else {
			// First-time portal donor: create Stripe Customer with user's email/name so Checkout
			// prefills and locks the email (no different-email mismatch).
			const email = user.contact?.email ?? null;
			if (!email) {
				return this.resultFail('User contact email is required for portal donations');
			}
			const name = [user.contact?.firstName, user.contact?.lastName].filter(Boolean).join(' ') || undefined;
			const createCustomerResult = await this.createStripeCustomerForPortal(email, name);
			if (!createCustomerResult.success) {
				return createCustomerResult;
			}
			stripeCustomerId = createCustomerResult.data;
			const contributorResult = await this.contributorService.getOrCreateContributorForAccount(
				user.accountId,
				stripeCustomerId,
				user.contactId,
			);
			if (!contributorResult.success) {
				return this.resultFail(contributorResult.error);
			}
		}

		const campaignResult = await this.campaignService.getActiveCampaignForProgram(input.programId);
		if (!campaignResult.success) {
			return this.resultFail(campaignResult.error);
		}

		const baseUrl = (process.env.BASE_URL ?? '').replace(/\/+$/, '');
		const successUrl = `${baseUrl}/portal/programs/${input.programId}/overview?donation=success`;

		return this.createCheckoutSession({
			amount: input.amount,
			currency: input.currency ?? 'CHF',
			intervalCount: input.intervalCount ?? 1,
			recurring: input.recurring ?? false,
			successUrl,
			campaignId: campaignResult.data.id,
			accountId: user.accountId,
			source: 'portal',
			stripeCustomerId,
		});
	}

	private async createStripeCustomerForPortal(
		email: string,
		name?: string,
	): Promise<ServiceResult<string>> {
		try {
			const customer = await this.stripe.customers.create({
				email,
				name: name || undefined,
			});
			return this.resultOk(customer.id);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create Stripe customer: ${JSON.stringify(error)}`);
		}
	}

	async getCheckoutSession(sessionId: string) {
		try {
			const checkoutSession = await this.stripe.checkout.sessions.retrieve(sessionId);

			if (!checkoutSession.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			return this.resultOk(checkoutSession);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not load Stripe checkout session: ${JSON.stringify(error)}`);
		}
	}

	async getContributorFromCheckoutSession(session: Stripe.Checkout.Session) {
		try {
			if (!session.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			const stripeCustomerId = session.customer.toString();
			const email = session.customer_details?.email ?? undefined;

			const contributorResult = await this.contributorService.findByStripeCustomerOrEmail(stripeCustomerId, email);

			if (!contributorResult.success) {
				return contributorResult;
			}

			return this.resultOk(contributorResult.data ?? null);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not load contributor from checkout session: ${JSON.stringify(error)}`);
		}
	}

	async updateContributorAfterCheckout(input: UpdateContributorAfterCheckoutInput) {
		try {
			const { stripeCheckoutSessionId, user } = input;

			const session = await this.stripe.checkout.sessions.retrieve(stripeCheckoutSessionId);
			if (!session.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			const stripeCustomer = await this.stripe.customers.retrieve(session.customer as string);
			if (stripeCustomer.deleted) {
				return this.resultFail(`Stripe customer ${stripeCustomer.id} was deleted`);
			}

			const contributorEmail = user.email || stripeCustomer.email || null;

			if (!contributorEmail) {
				return this.resultFail('A contributor email is required');
			}

			const existingResult = await this.contributorService.findByStripeCustomerOrEmail(
				stripeCustomer.id,
				contributorEmail,
			);

			if (!existingResult.success) {
				return existingResult;
			}

			let contributor = existingResult.data;

			if (!contributor) {
				const createResult = await this.contributorService.getOrCreateContributorWithFirebaseAuth({
					stripeCustomerId: stripeCustomer.id,
					email: contributorEmail,
					firstName: user.personal.name,
					lastName: user.personal.lastname,
					referral: user.personal.referral ?? ContributorReferralSource.other,
				});

				if (!createResult.success) {
					return createResult;
				}

				contributor = createResult.data.contributor;
			}

			const updateInput: ContributorUpdateInput = {
				id: contributor.id,
				referral: user.personal.referral ?? ContributorReferralSource.other,
				needsOnboarding: false,
				contact: {
					update: {
						data: {
							firstName: user.personal.name,
							lastName: user.personal.lastname,
							email: user.email,
							gender: user.personal.gender ?? null,
							language: user.language,
							address: {
								upsert: {
									update: {
										country: user.address.country,
									},
									create: {
										street: '',
										number: '',
										city: '',
										zip: '',
										country: user.address.country,
									},
								},
							},
						},
					},
				},
			};

			return this.contributorService.updateSelf(contributor.id, updateInput);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update contributor after checkout: ${JSON.stringify(error)}`);
		}
	}
}
