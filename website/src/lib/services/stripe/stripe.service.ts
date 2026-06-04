/**
 * TESTING WEBHOOKS:
 * 1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
 * 2. Login to Stripe: `stripe login`
 * 3. Forward webhooks to local endpoint:
 *    `stripe listen --forward-to localhost:3000/api/v1/stripe/webhook`
 * 4. Copy the webhook signing secret from CLI output and set in your env.local:
 *    STRIPE_WEBHOOK_SECRET=whsec_xxx...
 * 5. Make a test contribution - webhooks will be forwarded to your local server.
 */

import { ContributionStatus, ContributorReferralSource, PaymentEventType, PrismaClient } from '@/generated/prisma/client';
import type { CountryCode } from '@/generated/prisma/enums';
import { COUNTRY_CODES } from '@/lib/types/country';
import { isValidCurrency } from '@/lib/types/currency';
import { logger } from '@/lib/utils/logger';
import { titleCase } from '@/lib/utils/string-utils';
import { toSortKey } from '@/lib/utils/to-sort-key';
import Stripe from 'stripe';
import { CampaignReadService } from '../campaign/campaign-read.service';
import { ContributionWriteService } from '../contribution/contribution-write.service';
import { type PaymentEventCreateData, type StripeContributionCreateData } from '../contribution/contribution.types';
import { ContributorReadService } from '../contributor/contributor-read.service';
import { ContributorWriteService } from '../contributor/contributor-write.service';
import {
	type ContributorUpdateInput,
	type ContributorWithContact,
	type StripeContributorData,
} from '../contributor/contributor.types';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { assertContributorEmailMatchesCheckout, assertEmbeddedCheckoutSessionPaid } from './checkout-session-guards';
import {
	type CheckoutMetadata,
	type StripeBillingPortalSessionUrl,
	type StripeCheckoutCustomerPrefill,
	type StripeCheckoutOnboardingPrefill,
	type StripeContributorNameParts,
	type StripeCustomerData,
	type StripeEmbeddedCheckoutCreateInput,
	type StripeEmbeddedCheckoutResult,
	type StripeEmbeddedCheckoutSessionInput,
	type StripePaymentMethod,
	type StripeSubscriptionPaginatedTableView,
	type StripeSubscriptionRow,
	type StripeSubscriptionTableQuery,
	type StripeSubscriptionTableView,
	type StripeWebhookResult,
	type UpdateContributorAfterCheckoutInput,
	type UpdateContributorAfterCheckoutResult,
} from './stripe.types';
import { resolveWizardEmbeddedCheckout } from './wizard-embedded-checkout';

export class StripeService extends BaseService {
	private static stripeClient: Stripe | undefined;

	constructor(
		db: PrismaClient,
		private readonly contributorReadService: ContributorReadService,
		private readonly contributorWriteService: ContributorWriteService,
		private readonly contributionWriteService: ContributionWriteService,
		private readonly campaignReadService: CampaignReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async createEmbeddedCheckoutSession(
		input: StripeEmbeddedCheckoutSessionInput,
	): Promise<ServiceResult<StripeEmbeddedCheckoutResult>> {
		try {
			const resolved = resolveWizardEmbeddedCheckout(input.wizardContext, input.currency);
			if (!resolved.success) {
				return resolved;
			}

			const { unitAmount, recurring, campaignId, currency } = resolved.data;

			if (campaignId) {
				const campaignResult = await this.campaignReadService.getById(campaignId);
				if (!campaignResult.success) {
					return this.resultFail('Invalid campaign');
				}
			}

			const result = await this.createEmbeddedCheckout({
				amount: unitAmount,
				currency,
				recurring,
				intervalCount: 1,
				stripeCustomerId: input.stripeCustomerId,
				campaignId,
				source: 'donation-wizard',
			});

			if (!result.success) {
				return result;
			}

			return this.resultOk({
				clientSecret: result.data.clientSecret,
				sessionId: result.data.sessionId,
				publishableKey: result.data.publishableKey,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create embedded checkout session: ${JSON.stringify(error)}`);
		}
	}

	async getCheckoutOnboardingPrefill(sessionId: string): Promise<ServiceResult<StripeCheckoutOnboardingPrefill>> {
		try {
			const session = await this.getStripeClient().checkout.sessions.retrieve(sessionId);

			const paidCheck = assertEmbeddedCheckoutSessionPaid(session);
			if (!paidCheck.success) {
				return paidCheck;
			}

			if (!session.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
			const email = session.customer_details?.email ?? undefined;
			const contributorResult = await this.contributorReadService.findByStripeCustomerOrEmail(stripeCustomerId, email);

			if (!contributorResult.success) {
				return contributorResult;
			}

			const prefill = this.parseCheckoutCustomerDetails(session.customer_details);
			const needsOnboarding = !contributorResult.data || contributorResult.data.needsOnboarding;

			return this.resultOk({
				...prefill,
				needsOnboarding,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load checkout onboarding prefill: ${JSON.stringify(error)}`);
		}
	}

	async updateContributorAfterCheckout(
		input: UpdateContributorAfterCheckoutInput,
	): Promise<ServiceResult<UpdateContributorAfterCheckoutResult>> {
		try {
			const { stripeCheckoutSessionId, user } = input;

			const session = await this.getStripeClient().checkout.sessions.retrieve(stripeCheckoutSessionId);

			const paidCheck = assertEmbeddedCheckoutSessionPaid(session);
			if (!paidCheck.success) {
				return paidCheck;
			}

			if (!session.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			const stripeCustomerResult = await this.retrieveStripeCustomer(
				typeof session.customer === 'string' ? session.customer : session.customer.id,
			);
			if (!stripeCustomerResult.success) {
				return stripeCustomerResult;
			}

			const stripeCustomer = stripeCustomerResult.data;
			const emailCheck = assertContributorEmailMatchesCheckout(session, user.email);
			if (!emailCheck.success) {
				return emailCheck;
			}

			const contributorEmail = emailCheck.data ?? stripeCustomer.email ?? null;

			if (!contributorEmail) {
				return this.resultFail('A contributor email is required');
			}

			const existingResult = await this.contributorReadService.findByStripeCustomerOrEmail(
				stripeCustomer.id,
				contributorEmail,
			);

			if (!existingResult.success) {
				return existingResult;
			}

			let contributor = existingResult.data;

			if (!contributor) {
				const createResult = await this.contributorWriteService.getOrCreateContributorWithFirebaseAuth({
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
							email: contributorEmail,
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

			return this.contributorWriteService.updateSelf(contributor.id, updateInput);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update contributor after checkout: ${JSON.stringify(error)}`);
		}
	}

	async getSubscriptionsTableView(stripeCustomerId: string | null): Promise<ServiceResult<StripeSubscriptionTableView>> {
		try {
			const paginated = await this.getPaginatedSubscriptionsTableView(stripeCustomerId, {
				page: 1,
				pageSize: 10_000,
				search: '',
			});
			if (!paginated.success) {
				return this.resultFail(paginated.error);
			}

			return this.resultOk({ rows: paginated.data.rows });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch subscriptions table view: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedSubscriptionsTableView(
		stripeCustomerId: string | null,
		query: StripeSubscriptionTableQuery,
	): Promise<ServiceResult<StripeSubscriptionPaginatedTableView>> {
		try {
			if (!stripeCustomerId) {
				return this.resultOk({ rows: [], totalCount: 0 });
			}

			const subscriptions = await this.getStripeClient().subscriptions.list({
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
					const paymentMethod = await this.resolveSubscriptionPaymentMethod(sub.default_payment_method);

					return {
						id: sub.id,
						created: new Date(sub.start_date * 1000),
						status: sub.status,
						amount,
						interval,
						currency,
						paymentMethod,
					};
				}),
			);

			const sortedRows = this.sortSubscriptionRows(rows, query);
			const offset = (query.page - 1) * query.pageSize;
			const paginatedRows = sortedRows.slice(offset, offset + query.pageSize);

			return this.resultOk({ rows: paginatedRows, totalCount: sortedRows.length });
		} catch (error) {
			const stripeError = error as { type?: string; code?: string; param?: string; message?: string };
			const isMissingCustomer =
				stripeError.type === 'StripeInvalidRequestError' &&
				stripeError.code === 'resource_missing' &&
				(stripeError.param === 'customer' || stripeError.message?.includes('No such customer'));
			if (isMissingCustomer) {
				this.logger.warn('Stripe customer not found in current mode; returning empty subscriptions', {
					stripeCustomerId,
				});

				return this.resultOk({ rows: [], totalCount: 0 });
			}

			this.logger.error(error);

			return this.resultFail(`Could not fetch subscriptions: ${JSON.stringify(error)}`);
		}
	}

	async createManageSubscriptionsSession(
		stripeCustomerId: string | null,
		language: string | null,
	): Promise<ServiceResult<StripeBillingPortalSessionUrl>> {
		try {
			if (!stripeCustomerId) {
				return this.resultFail('Missing Stripe customer ID');
			}

			const session = await this.getStripeClient().billingPortal.sessions.create({
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

	async handleWebhookEvent(
		body: string,
		signature: string,
		webhookSecret: string,
	): Promise<ServiceResult<StripeWebhookResult>> {
		try {
			const event = this.getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);

			switch (event.type) {
				case 'charge.succeeded':
				case 'charge.updated':
				case 'charge.failed': {
					const charge = event.data.object;
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

	private getStripeClient(): Stripe {
		if (StripeService.stripeClient) {
			return StripeService.stripeClient;
		}

		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			throw new Error('Missing STRIPE_SECRET_KEY environment variable');
		}
		if (!stripeSecretKey.startsWith('sk_')) {
			throw new Error('Invalid STRIPE_SECRET_KEY format');
		}

		StripeService.stripeClient = new Stripe(stripeSecretKey, { typescript: true });

		return StripeService.stripeClient;
	}

	private isCountryCode(value: string): value is CountryCode {
		return (COUNTRY_CODES as readonly string[]).includes(value);
	}

	private parseCheckoutCustomerDetails(
		details: Stripe.Checkout.Session.CustomerDetails | null | undefined,
	): StripeCheckoutCustomerPrefill {
		const email = details?.email ?? undefined;
		const rawName = details?.name?.trim();

		let firstname: string | undefined;
		let lastname: string | undefined;

		if (rawName) {
			const parts = rawName.split(/\s+/);
			firstname = parts[0];
			if (parts.length > 1) {
				lastname = parts.slice(1).join(' ');
			}
		}

		const countryRaw = details?.address?.country?.toUpperCase();
		const country = countryRaw && this.isCountryCode(countryRaw) ? countryRaw : undefined;

		return { email, firstname, lastname, country };
	}

	private async createEmbeddedCheckout(
		data: StripeEmbeddedCheckoutCreateInput,
	): Promise<ServiceResult<StripeEmbeddedCheckoutResult>> {
		try {
			const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
			if (!publishableKey) {
				return this.resultFail('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
			}

			const {
				amount,
				currency = 'USD',
				intervalCount = 1,
				returnUrl,
				recurring = false,
				stripeCustomerId,
				campaignId,
				accountId,
				source,
			} = data;

			const metadata: Record<string, string> = {};
			if (campaignId) {
				metadata.campaignId = campaignId;
			}
			if (accountId) {
				metadata.accountId = accountId;
			}
			if (source) {
				metadata.source = source;
			}

			const stripe = this.getStripeClient();

			const price = await stripe.prices.create({
				active: true,
				unit_amount: amount,
				currency: currency.toLowerCase(),
				product: recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME,
				recurring: recurring ? { interval: 'month', interval_count: intervalCount } : undefined,
			});

			const session = await stripe.checkout.sessions.create({
				mode: recurring ? 'subscription' : 'payment',
				ui_mode: 'embedded',
				customer: stripeCustomerId ?? undefined,
				customer_creation: !stripeCustomerId && !recurring ? 'always' : undefined,
				line_items: [{ price: price.id, quantity: 1 }],
				redirect_on_completion: 'never',
				...(returnUrl ? { return_url: returnUrl } : {}),
				locale: 'auto',
				...(Object.keys(metadata).length > 0 && { metadata }),
				...(recurring &&
					campaignId && {
						subscription_data: {
							metadata: { campaignId },
						},
					}),
			});

			if (!session.client_secret) {
				return this.resultFail('Embedded checkout session has no client secret');
			}

			return this.resultOk({
				clientSecret: session.client_secret,
				sessionId: session.id,
				publishableKey,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create Stripe checkout session: ${JSON.stringify(error)}`);
		}
	}

	private async resolveSubscriptionPaymentMethod(
		defaultPaymentMethod: Stripe.Subscription['default_payment_method'],
	): Promise<StripePaymentMethod> {
		if (defaultPaymentMethod && typeof defaultPaymentMethod !== 'string') {
			return this.mapPaymentMethod(defaultPaymentMethod);
		}

		if (typeof defaultPaymentMethod !== 'string' || defaultPaymentMethod.trim() === '') {
			return { type: 'other', label: 'Unknown' };
		}

		try {
			const method = await this.getStripeClient().paymentMethods.retrieve(defaultPaymentMethod);

			return this.mapPaymentMethod(method);
		} catch (error) {
			const stripeError = error as { type?: string; code?: string };
			const isMissingResource = stripeError.type === 'StripeInvalidRequestError' && stripeError.code === 'resource_missing';
			if (isMissingResource) {
				return { type: 'other', label: 'Unknown' };
			}

			throw error;
		}
	}

	private sortSubscriptionRows(rows: StripeSubscriptionRow[], query: StripeSubscriptionTableQuery): StripeSubscriptionRow[] {
		const direction = query.sortDirection === 'asc' ? 1 : -1;
		const sortedRows = [...rows];
		const sortBy = toSortKey(query.sortBy, ['created', 'status', 'interval', 'paymentMethod', 'amount'] as const);
		sortedRows.sort((a, b) => {
			switch (sortBy) {
				case 'created':
					return (a.created.getTime() - b.created.getTime()) * direction;
				case 'status':
					return a.status.localeCompare(b.status) * direction;
				case 'interval':
					return a.interval.localeCompare(b.interval) * direction;
				case 'paymentMethod':
					return a.paymentMethod.label.localeCompare(b.paymentMethod.label) * direction;
				case 'amount':
					return (a.amount - b.amount) * direction;
				default:
					return b.created.getTime() - a.created.getTime();
			}
		});

		return sortedRows;
	}

	private mapPaymentMethod(paymentMethod: Stripe.PaymentMethod): StripePaymentMethod {
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

	private async processChargeEvent(charge: Stripe.Charge): Promise<ServiceResult<StripeWebhookResult>> {
		try {
			const fullCharge = await this.getStripeClient().charges.retrieve(charge.id, {
				expand: ['balance_transaction', 'invoice'],
			});

			const customerId = fullCharge.customer;
			if (!customerId || typeof customerId !== 'string') {
				return this.resultFail('Charge has no Stripe customer');
			}

			const stripeCustomerResult = await this.retrieveStripeCustomer(customerId);
			if (!stripeCustomerResult.success) {
				return stripeCustomerResult;
			}

			const stripeCustomer = stripeCustomerResult.data;
			const checkoutMetadata = await this.getCheckoutMetadata(fullCharge);

			let contributor: ContributorWithContact | undefined;
			let isNewContributor = false;

			const accountId = checkoutMetadata?.accountId;
			if (accountId) {
				const user = await this.db.user.findUnique({
					where: { accountId },
					select: { contactId: true },
				});
				if (user) {
					const portalResult = await this.contributorWriteService.getOrCreateContributorForAccount(
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
				if (fullCharge.status === 'succeeded') {
					const { firstName, lastName } = this.splitContributorName(stripeCustomer.name);
					const contributorData: StripeContributorData = {
						stripeCustomerId: stripeCustomer.id,
						email: stripeCustomer.email,
						firstName,
						lastName,
						referral: ContributorReferralSource.other,
					};

					const contributorResult =
						await this.contributorWriteService.getOrCreateContributorWithFirebaseAuth(contributorData);
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
					const existingContributorResult = await this.contributorReadService.findByStripeCustomerOrEmail(
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

			let campaignId = checkoutMetadata?.campaignId;
			if (!campaignId) {
				const fallbackCampaignResult = await this.campaignReadService.getFallbackCampaign();
				if (!fallbackCampaignResult.success) {
					this.logger.error(fallbackCampaignResult.error);

					return this.resultFail(fallbackCampaignResult.error);
				}
				campaignId = fallbackCampaignResult.data.id;
			}

			const chargeCurrency = fullCharge.currency.toUpperCase();
			if (!isValidCurrency(chargeCurrency)) {
				return this.resultFail(`Unsupported currency from Stripe charge: ${fullCharge.currency}`);
			}

			const contributionData: StripeContributionCreateData = {
				contributorId: contributor.id,
				amount: fullCharge.amount / 100,
				currency: chargeCurrency,
				amountChf: this.extractAmountChf(fullCharge),
				feesChf: this.extractFeesChf(fullCharge),
				status: this.constructContributionStatus(fullCharge.status),
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

			const contributionResult = await this.contributionWriteService.upsertFromStripeEvent(
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
		const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;

		return balanceTransaction?.amount ? balanceTransaction.amount / 100 : 0;
	}

	private extractFeesChf(charge: Stripe.Charge): number {
		const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;

		return balanceTransaction?.fee ? balanceTransaction.fee / 100 : 0;
	}

	private async retrieveStripeCustomer(customerId: string): Promise<ServiceResult<StripeCustomerData>> {
		try {
			const customer = await this.getStripeClient().customers.retrieve(customerId);
			if (customer.deleted) {
				return this.resultFail(`Deleted Stripe customer: ${customerId}`);
			}

			return this.resultOk(customer as StripeCustomerData);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not retrieve Stripe customer: ${JSON.stringify(error)}`);
		}
	}

	private async getCheckoutMetadata(charge: Stripe.Charge): Promise<CheckoutMetadata | null> {
		try {
			const paymentIntent = charge.payment_intent;
			if (!paymentIntent) {
				return null;
			}
			const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent.id;

			const sessions = await this.getStripeClient().checkout.sessions.list({
				payment_intent: paymentIntentId.toString(),
			});

			const session = sessions.data.length > 0 ? sessions.data[0] : null;

			return session?.metadata ?? null;
		} catch (error) {
			this.logger.error(error);

			return null;
		}
	}

	private constructContributionStatus(status: Stripe.Charge.Status): ContributionStatus {
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

	private splitContributorName(fullName?: string | null): StripeContributorNameParts {
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
