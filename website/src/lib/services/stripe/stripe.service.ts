/**
 * TESTING WEBHOOKS:
 * 1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
 * 2. Login to Stripe: `stripe login`
 * 3. Forward webhooks to local endpoint (include subscription lifecycle events):
 *    `stripe listen --forward-to localhost:3000/api/v1/stripe/webhook \
 *      --events charge.succeeded,charge.updated,charge.failed,customer.updated,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted`
 * 4. Copy the webhook signing secret from CLI output and set in your env.local:
 *    STRIPE_WEBHOOK_SECRET=whsec_xxx...
 * 5. Make a test contribution - webhooks will be forwarded to your local server.
 *
 * Production Stripe webhook endpoint must also allow:
 * charge.succeeded, charge.updated, charge.failed, customer.updated,
 * customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 */

import {
	ContributionStatus,
	ContributorReferralSource,
	PaymentEventType,
	PrismaClient,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
} from '@/generated/prisma/client';
import type { CountryCode, SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { COUNTRY_CODES } from '@/lib/types/country';
import { isValidCurrency } from '@/lib/types/currency';
import { logger } from '@/lib/utils/logger';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
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
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import {
	isSubscriptionAmountInRange,
	SUBSCRIPTION_AMOUNT_MAX,
	SUBSCRIPTION_AMOUNT_MIN,
} from '../subscription/subscription-amount';
import { mapCancellationReasonToStripeFeedback } from '../subscription/subscription-cancellation';
import { SubscriptionWriteService } from '../subscription/subscription-write.service';
import {
	mapStripeRecurringInterval,
	mapStripeSubscriptionLifecycle,
	resolveStripeResourceId,
	resolveStripeSubscriptionCanceledAt,
	resolveStripeSubscriptionIdFromInvoice,
} from '../subscription/subscription.mappers';
import { assertContributorEmailMatchesCheckout, assertEmbeddedCheckoutSessionPaid } from './checkout-session-guards';
import {
	APPLY_PAYMENT_METHOD_QUERY_PARAM,
	type ApplyCustomerDefaultPaymentMethodInput,
	type CheckoutMetadata,
	type CreateManageSubscriptionsSessionInput,
	type PortalProgramDonationCheckoutInput,
	type StripeBillingPortalSessionUrl,
	type StripeCheckoutCustomerPrefill,
	type StripeCheckoutOnboardingPrefill,
	type StripeContributorNameParts,
	type StripeCustomerData,
	type StripeEmbeddedCheckoutCreateInput,
	type StripeEmbeddedCheckoutResult,
	type StripeEmbeddedCheckoutSessionInput,
	type StripeHostedCheckoutCreateInput,
	type StripePaymentMethod,
	type StripeSubscriptionDetails,
	type StripeSubscriptionPaginatedTableView,
	type StripeSubscriptionRow,
	type StripeSubscriptionTableQuery,
	type StripeSubscriptionTableView,
	type StripeWebhookResult,
	type UpdateContributorAfterCheckoutInput,
	type UpdateContributorAfterCheckoutResult,
	type UpdateContributorReferralAfterCheckoutInput,
	type UpdateContributorReferralAfterCheckoutResult,
} from './stripe.types';
import { resolveWizardEmbeddedCheckout } from './wizard-embedded-checkout';

const STRIPE_CHECKOUT_SESSION_ID_PARAM = 'donation_checkout_session_id';
const CHECKOUT_SESSION_ID_PLACEHOLDER = '{CHECKOUT_SESSION_ID}';

export class StripeService extends BaseService {
	private static stripeClient: Stripe | undefined;

	constructor(
		db: PrismaClient,
		private readonly contributorReadService: ContributorReadService,
		private readonly contributorWriteService: ContributorWriteService,
		private readonly contributionWriteService: ContributionWriteService,
		private readonly subscriptionWriteService: SubscriptionWriteService,
		private readonly campaignReadService: CampaignReadService,
		private readonly programAccessReadService: ProgramAccessReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async createPortalProgramDonationCheckout(
		userId: string,
		input: PortalProgramDonationCheckoutInput,
	): Promise<ServiceResult<string>> {
		try {
			const accessResult = await this.programAccessReadService.getAccessiblePrograms(userId);
			if (!accessResult.success || !accessResult.data.some((program) => program.programId === input.programId)) {
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
				const contributorResult = await this.contributorWriteService.getOrCreateContributorForAccount(
					user.accountId,
					stripeCustomerId,
					user.contactId,
				);
				if (!contributorResult.success) {
					return this.resultFail(contributorResult.error);
				}
			}

			const campaignResult = await this.campaignReadService.getActiveCampaignForProgram(input.programId);
			if (!campaignResult.success) {
				return this.resultFail(campaignResult.error);
			}

			const baseUrl = (process.env.BASE_URL ?? '').replace(TRAILING_SLASHES_REGEX, '');
			const successUrl = `${baseUrl}/portal/programs/${input.programId}/overview?donation=success`;

			return this.createHostedCheckoutSession({
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
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create portal donation checkout session: ${JSON.stringify(error)}`);
		}
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

			const returnUrlResult = this.resolveEmbeddedCheckoutReturnUrl(input.returnPath);
			if (!returnUrlResult.success) {
				return returnUrlResult;
			}

			const result = await this.createEmbeddedCheckout({
				amount: unitAmount,
				currency,
				recurring,
				intervalCount: 1,
				returnUrl: returnUrlResult.data,
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

	private resolveEmbeddedCheckoutReturnUrl(returnPath: string | undefined): ServiceResult<string | undefined> {
		if (!returnPath) {
			return this.resultOk(undefined);
		}

		if (!returnPath.startsWith('/') || returnPath.startsWith('//')) {
			return this.resultFail('Invalid Stripe checkout return path');
		}

		const baseUrl = process.env.BASE_URL?.replace(TRAILING_SLASHES_REGEX, '');
		if (!baseUrl) {
			return this.resultFail('Missing BASE_URL');
		}

		const url = new URL(returnPath, baseUrl);
		url.search = '';
		url.searchParams.set(STRIPE_CHECKOUT_SESSION_ID_PARAM, CHECKOUT_SESSION_ID_PLACEHOLDER);

		return this.resultOk(
			url.toString().replace(encodeURIComponent(CHECKOUT_SESSION_ID_PLACEHOLDER), CHECKOUT_SESSION_ID_PLACEHOLDER),
		);
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
				...(user.personal.referral !== undefined ? { referral: user.personal.referral } : {}),
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

	async updateContributorReferralAfterCheckout(
		input: UpdateContributorReferralAfterCheckoutInput,
	): Promise<ServiceResult<UpdateContributorReferralAfterCheckoutResult>> {
		try {
			const { stripeCheckoutSessionId, referral } = input;

			const session = await this.getStripeClient().checkout.sessions.retrieve(stripeCheckoutSessionId);

			const paidCheck = assertEmbeddedCheckoutSessionPaid(session);
			if (!paidCheck.success) {
				return paidCheck;
			}

			if (!session.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
			const email = session.customer_details?.email ?? undefined;
			const existingResult = await this.contributorReadService.findByStripeCustomerOrEmail(stripeCustomerId, email);

			if (!existingResult.success) {
				return existingResult;
			}

			const contributor = existingResult.data;
			if (!contributor) {
				return this.resultFail('Contributor not found for checkout session');
			}

			const contributorEmail = contributor.contact?.email;
			if (!contributorEmail) {
				return this.resultFail('Contributor email is required');
			}

			return this.contributorWriteService.updateSelf(contributor.id, {
				referral,
				contact: {
					update: {
						data: {
							email: contributorEmail,
						},
					},
				},
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update contributor referral after checkout: ${JSON.stringify(error)}`);
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
		input: CreateManageSubscriptionsSessionInput,
	): Promise<ServiceResult<StripeBillingPortalSessionUrl>> {
		try {
			const { stripeCustomerId, language, flow, subscriptionId } = input;
			if (!stripeCustomerId) {
				return this.resultFail('Missing Stripe customer ID');
			}

			const baseUrl = (process.env.BASE_URL ?? '').replace(TRAILING_SLASHES_REGEX, '');
			const returnUrl = `${baseUrl}/dashboard/subscriptions?${APPLY_PAYMENT_METHOD_QUERY_PARAM}=${encodeURIComponent(subscriptionId)}`;

			const session = await this.getStripeClient().billingPortal.sessions.create({
				customer: stripeCustomerId,
				return_url: returnUrl,
				locale: (language as Stripe.BillingPortal.SessionCreateParams.Locale) ?? 'auto',
				flow_data: { type: flow },
			});

			if (!session.url) {
				return this.resultFail('No billing portal URL returned');
			}

			return this.resultOk(session.url);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create billing portal session');
		}
	}

	async applyCustomerDefaultPaymentMethodToOwnedSubscription(
		input: ApplyCustomerDefaultPaymentMethodInput,
	): Promise<ServiceResult<void>> {
		try {
			const { contributorId, stripeCustomerId, subscriptionId } = input;
			if (!stripeCustomerId) {
				return this.resultFail('Missing Stripe customer ID');
			}

			const subscription = await this.db.subscription.findFirst({
				where: this.ownedActiveStripeSubscriptionWhere(contributorId, subscriptionId),
				select: { id: true },
			});
			if (!subscription) {
				return this.resultFail('Subscription not found');
			}

			const customer = await this.getStripeClient().customers.retrieve(stripeCustomerId);
			if (customer.deleted) {
				return this.resultFail('Stripe customer is deleted');
			}

			return this.copyCustomerDefaultPaymentMethodToSubscriptions(customer);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not apply default payment method to subscription');
		}
	}

	async updateContributorSubscriptionAmount(input: {
		contributorId: string;
		subscriptionId: string;
		amount: number;
	}): Promise<ServiceResult<{ amount: number; currency: string }>> {
		try {
			const { contributorId, subscriptionId, amount } = input;
			if (!isSubscriptionAmountInRange(amount)) {
				return this.resultFail(
					`Amount must be an integer between ${SUBSCRIPTION_AMOUNT_MIN} and ${SUBSCRIPTION_AMOUNT_MAX}`,
				);
			}

			const subscription = await this.db.subscription.findFirst({
				where: this.ownedActiveStripeSubscriptionWhere(contributorId, subscriptionId),
				select: {
					id: true,
					campaignId: true,
					currency: true,
					stripeSubscriptionId: true,
				},
			});
			if (!subscription?.stripeSubscriptionId) {
				return this.resultFail('Subscription not found');
			}

			const stripe = this.getStripeClient();
			const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
			const item = stripeSubscription.items.data[0];
			if (!item) {
				return this.resultFail('Stripe subscription has no items');
			}

			const existingPrice = item.price;
			const productId =
				typeof existingPrice.product === 'string' ? existingPrice.product : (existingPrice.product?.id ?? null);
			if (!productId) {
				return this.resultFail('Stripe subscription item has no product');
			}

			const recurring = existingPrice.recurring;
			if (!recurring || !mapStripeRecurringInterval(recurring.interval, recurring.interval_count)) {
				return this.resultFail('Only monthly Stripe subscriptions can be updated');
			}

			const stripeCurrency = existingPrice.currency.toLowerCase();
			if (stripeCurrency !== subscription.currency.toLowerCase()) {
				return this.resultFail('Subscription currency does not match Stripe price');
			}

			const unitAmount = amount * 100;
			let stripeSubscriptionToSync = stripeSubscription;
			if (existingPrice.unit_amount !== unitAmount) {
				const price = await stripe.prices.create({
					currency: stripeCurrency,
					product: productId,
					unit_amount: unitAmount,
					recurring: {
						interval: 'month',
						interval_count: 1,
					},
				});

				stripeSubscriptionToSync = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
					items: [{ id: item.id, price: price.id }],
					proration_behavior: 'none',
				});
			}

			const upsertResult = await this.syncStripeSubscriptionAmount({
				stripeSubscription: stripeSubscriptionToSync,
				contributorId,
				campaignId: subscription.campaignId,
				subscriptionId,
				stripeSubscriptionId: subscription.stripeSubscriptionId,
			});
			if (!upsertResult.success) {
				return this.resultFail(upsertResult.error);
			}

			return this.resultOk({ amount, currency: subscription.currency });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update subscription amount');
		}
	}

	async cancelContributorSubscription(input: {
		contributorId: string;
		subscriptionId: string;
		reason: SubscriptionCancellationReason;
	}): Promise<ServiceResult<void>> {
		try {
			const subscription = await this.db.subscription.findFirst({
				where: {
					id: input.subscriptionId,
					contributorId: input.contributorId,
					paymentMethod: SubscriptionPaymentMethod.stripe,
				},
				select: {
					id: true,
					stripeSubscriptionId: true,
					status: true,
				},
			});
			if (!subscription?.stripeSubscriptionId) {
				return this.resultFail('Subscription not found');
			}

			if (subscription.status === SubscriptionStatus.ended) {
				return this.resultFail('Subscription not found');
			}

			const stripe = this.getStripeClient();
			let stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

			if (stripeSubscription.status !== 'canceled') {
				await this.voidOpenSubscriptionInvoices(stripe, subscription.stripeSubscriptionId);
				stripeSubscription = await stripe.subscriptions.cancel(subscription.stripeSubscriptionId, {
					invoice_now: false,
					prorate: false,
					cancellation_details: {
						feedback: mapCancellationReasonToStripeFeedback(input.reason),
					},
				});
			}

			const lifecycle = mapStripeSubscriptionLifecycle(stripeSubscription);

			try {
				await this.db.subscription.update({
					where: { id: subscription.id },
					data: {
						status: lifecycle?.status ?? SubscriptionStatus.ended,
						canceledAt: lifecycle?.canceledAt ?? resolveStripeSubscriptionCanceledAt(stripeSubscription),
						cancellationReason: input.reason,
					},
				});
			} catch (error) {
				this.logger.alert(
					error,
					{
						subscriptionId: subscription.id,
						stripeSubscriptionId: subscription.stripeSubscriptionId,
					},
					{ component: 'stripe-subscription-cancel' },
				);

				return this.resultFail('Could not cancel subscription');
			}

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not cancel subscription');
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
				case 'customer.updated': {
					const customer = event.data.object;
					const previousInvoiceSettings = event.data.previous_attributes?.invoice_settings;
					if (!previousInvoiceSettings || !('default_payment_method' in previousInvoiceSettings)) {
						return this.resultOk({ skipReason: 'Customer default payment method unchanged' });
					}
					if (customer.deleted) {
						return this.resultOk({ skipReason: 'Stripe customer is deleted' });
					}

					this.logger.info('Processing customer default payment method update', { customerId: customer.id });
					const result = await this.copyCustomerDefaultPaymentMethodToSubscriptions(customer);
					if (!result.success) {
						this.logger.error(result.error);

						return this.resultFail(result.error);
					}

					return this.resultOk({});
				}
				case 'customer.subscription.created':
				case 'customer.subscription.updated':
				case 'customer.subscription.deleted': {
					const subscription = event.data.object;
					this.logger.info('Processing subscription event', {
						eventType: event.type,
						subscriptionId: subscription.id,
					});

					const result = await this.processSubscriptionEvent(subscription);
					if (!result.success) {
						this.logger.error(result.error);

						return this.resultFail(result.error);
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

	private ownedActiveStripeSubscriptionWhere(contributorId: string, subscriptionId: string) {
		return {
			id: subscriptionId,
			contributorId,
			paymentMethod: SubscriptionPaymentMethod.stripe,
			status: SubscriptionStatus.active,
		};
	}

	private async syncStripeSubscriptionAmount(input: {
		stripeSubscription: Stripe.Subscription;
		contributorId: string;
		campaignId: string;
		subscriptionId: string;
		stripeSubscriptionId: string;
	}): Promise<ServiceResult<void>> {
		const upsertResult = await this.subscriptionWriteService.upsertFromStripeSubscription({
			stripeSubscription: input.stripeSubscription,
			contributorId: input.contributorId,
			campaignId: input.campaignId,
		});
		if (!upsertResult.success || !upsertResult.data) {
			this.logger.alert(
				'Stripe subscription amount updated but database sync failed',
				{
					subscriptionId: input.subscriptionId,
					stripeSubscriptionId: input.stripeSubscriptionId,
					error: upsertResult.success ? 'Could not sync updated subscription' : upsertResult.error,
				},
				{ component: 'stripe-subscription-amount' },
			);

			return this.resultFail('Could not sync updated subscription');
		}

		return this.resultOk(undefined);
	}

	private async copyCustomerDefaultPaymentMethodToSubscriptions(customer: Stripe.Customer): Promise<ServiceResult<void>> {
		try {
			const defaultPaymentMethodId = resolveStripeResourceId(customer.invoice_settings.default_payment_method);
			if (!defaultPaymentMethodId) {
				return this.resultOk(undefined);
			}

			const stripe = this.getStripeClient();
			const subscriptions = await stripe.subscriptions.list({
				customer: customer.id,
				limit: 100,
			});

			for (const subscription of subscriptions.data) {
				const currentPaymentMethodId = resolveStripeResourceId(subscription.default_payment_method);
				if (currentPaymentMethodId === defaultPaymentMethodId) {
					continue;
				}

				await stripe.subscriptions.update(subscription.id, {
					default_payment_method: defaultPaymentMethodId,
				});
			}

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not copy default payment method to subscriptions');
		}
	}

	private async voidOpenSubscriptionInvoices(stripe: Stripe, stripeSubscriptionId: string) {
		try {
			const invoices = await stripe.invoices.list({
				subscription: stripeSubscriptionId,
				status: 'open',
				limit: 100,
			});

			for (const invoice of invoices.data) {
				try {
					await stripe.invoices.voidInvoice(invoice.id);
				} catch (error) {
					this.logger.warn('Could not void open invoice while canceling subscription', {
						invoiceId: invoice.id,
						stripeSubscriptionId,
						error,
					});
				}
			}
		} catch (error) {
			this.logger.warn('Could not list open invoices while canceling subscription', {
				stripeSubscriptionId,
				error,
			});
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
		details: Stripe.Checkout.Session['customer_details'] | undefined,
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
			const productId = recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME;
			if (!productId) {
				return this.resultFail(recurring ? 'Missing STRIPE_PRODUCT_RECURRING' : 'Missing STRIPE_PRODUCT_ONETIME');
			}

			const session = await stripe.checkout.sessions.create({
				mode: recurring ? 'subscription' : 'payment',
				ui_mode: 'embedded_page',
				customer: stripeCustomerId ?? undefined,
				customer_creation: !stripeCustomerId && !recurring ? 'always' : undefined,
				line_items: [
					{
						quantity: 1,
						price_data: {
							currency: currency.toLowerCase(),
							unit_amount: amount,
							product: productId,
							...(recurring && { recurring: { interval: 'month', interval_count: intervalCount } }),
						},
					},
				],
				redirect_on_completion: returnUrl ? 'if_required' : 'never',
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

	private async createHostedCheckoutSession(data: StripeHostedCheckoutCreateInput): Promise<ServiceResult<string>> {
		try {
			const {
				amount,
				successUrl,
				currency = 'USD',
				intervalCount = 1,
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
			const productId = recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME;
			if (!productId) {
				return this.resultFail(recurring ? 'Missing STRIPE_PRODUCT_RECURRING' : 'Missing STRIPE_PRODUCT_ONETIME');
			}

			const session = await stripe.checkout.sessions.create({
				mode: recurring ? 'subscription' : 'payment',
				customer: stripeCustomerId ?? undefined,
				customer_creation: !stripeCustomerId && !recurring ? 'always' : undefined,
				line_items: [
					{
						quantity: 1,
						price_data: {
							currency: currency.toLowerCase(),
							unit_amount: amount,
							product: productId,
							...(recurring && { recurring: { interval: 'month', interval_count: intervalCount } }),
						},
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

			if (!session.url) {
				return this.resultFail('Hosted checkout session has no redirect URL');
			}

			return this.resultOk(session.url);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create Stripe checkout session: ${JSON.stringify(error)}`);
		}
	}

	private async createStripeCustomerForPortal(email: string, name?: string): Promise<ServiceResult<string>> {
		try {
			const customer = await this.getStripeClient().customers.create({
				email,
				name: name ?? undefined,
			});

			return this.resultOk(customer.id);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create Stripe customer: ${JSON.stringify(error)}`);
		}
	}

	async getSubscriptionStripeDetails(stripeSubscriptionId: string): Promise<StripeSubscriptionDetails | null> {
		try {
			const subscription = await this.getStripeClient().subscriptions.retrieve(stripeSubscriptionId, {
				expand: ['default_payment_method'],
			});
			const firstItem = subscription.items.data[0];
			const currentPeriodEnd =
				typeof firstItem?.current_period_end === 'number' ? new Date(firstItem.current_period_end * 1000) : null;
			const paymentMethod = subscription.default_payment_method;
			const card =
				paymentMethod && typeof paymentMethod !== 'string' && paymentMethod.type === 'card' ? paymentMethod.card : null;

			if (!card) {
				return { currentPeriodEnd };
			}

			return {
				brand: titleCase(card.brand),
				last4: card.last4,
				currentPeriodEnd,
			};
		} catch (error) {
			const stripeError = error as { type?: string; code?: string };
			const isMissingResource = stripeError.type === 'StripeInvalidRequestError' && stripeError.code === 'resource_missing';
			if (isMissingResource) {
				return null;
			}

			this.logger.warn('Could not retrieve Stripe subscription details', { stripeSubscriptionId });

			return null;
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
				expand: ['balance_transaction'],
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

			const stripeSubscription = await this.resolveStripeSubscriptionForCharge(fullCharge);

			if (stripeSubscription) {
				const metadataCampaignId = await this.resolveExistingCampaignId(stripeSubscription.metadata?.campaignId);
				if (metadataCampaignId) {
					campaignId = metadataCampaignId;
				}

				const subscriptionResult = await this.subscriptionWriteService.upsertFromStripeSubscription({
					stripeSubscription,
					contributorId: contributor.id,
					campaignId,
				});
				if (!subscriptionResult.success) {
					this.logger.error('Subscription upsert failed; continuing with contribution write', {
						chargeId: fullCharge.id,
						stripeSubscriptionId: stripeSubscription.id,
						error: subscriptionResult.error,
					});
				} else if (!subscriptionResult.data) {
					this.logger.warn('Could not map Stripe subscription for charge; continuing with contribution write', {
						chargeId: fullCharge.id,
						stripeSubscriptionId: stripeSubscription.id,
						status: stripeSubscription.status,
					});
				}
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

	private async processSubscriptionEvent(subscription: Stripe.Subscription): Promise<ServiceResult<StripeWebhookResult>> {
		try {
			const customerId = resolveStripeResourceId(subscription.customer);
			if (!customerId) {
				return this.resultOk({ skipReason: `Subscription ${subscription.id} has no customer` });
			}

			const contributorResult = await this.contributorReadService.findByStripeCustomerOrEmail(customerId);
			if (!contributorResult.success) {
				return this.resultFail(contributorResult.error);
			}
			if (!contributorResult.data) {
				this.logger.info('Skipping subscription event for unknown contributor', {
					subscriptionId: subscription.id,
					customerId,
				});

				return this.resultOk({ skipReason: 'No contributor for Stripe customer' });
			}

			let campaignId = await this.resolveExistingCampaignId(subscription.metadata?.campaignId);

			if (!campaignId) {
				const existing = await this.db.subscription.findUnique({
					where: { stripeSubscriptionId: subscription.id },
					select: { campaignId: true },
				});
				campaignId = existing?.campaignId;
			}

			if (!campaignId) {
				const fallbackCampaignResult = await this.campaignReadService.getFallbackCampaign();
				if (!fallbackCampaignResult.success) {
					return this.resultFail(fallbackCampaignResult.error);
				}
				campaignId = fallbackCampaignResult.data.id;
			}

			const upsertResult = await this.subscriptionWriteService.syncFromStripeSubscriptionEvent({
				stripeSubscription: subscription,
				contributorId: contributorResult.data.id,
				campaignId,
			});
			if (!upsertResult.success) {
				return this.resultFail(upsertResult.error);
			}
			if (!upsertResult.data) {
				return this.resultOk({
					skipReason: `Could not sync Stripe subscription ${subscription.id}`,
				});
			}

			return this.resultOk({
				contributorId: contributorResult.data.id,
				isNewContributor: false,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to process subscription event: ${JSON.stringify(error)}`);
		}
	}

	private async resolveExistingCampaignId(campaignId: string | undefined): Promise<string | undefined> {
		if (!campaignId) {
			return undefined;
		}

		const campaign = await this.db.campaign.findUnique({
			where: { id: campaignId },
			select: { id: true },
		});

		return campaign?.id;
	}

	private async resolveStripeSubscriptionForCharge(charge: Stripe.Charge): Promise<Stripe.Subscription | null> {
		try {
			const legacyInvoice = (charge as Stripe.Charge & { invoice?: string | Stripe.Invoice | null }).invoice;
			const subscriptionIdFromLegacyInvoice = await this.resolveSubscriptionIdFromInvoiceRef(legacyInvoice);
			if (subscriptionIdFromLegacyInvoice) {
				return await this.getStripeClient().subscriptions.retrieve(subscriptionIdFromLegacyInvoice, {
					expand: ['items.data.price'],
				});
			}

			const paymentIntentId = resolveStripeResourceId(charge.payment_intent);
			if (!paymentIntentId) {
				return null;
			}

			const invoicePayments = await this.getStripeClient().invoicePayments.list({
				payment: { type: 'payment_intent', payment_intent: paymentIntentId },
				limit: 1,
				expand: ['data.invoice'],
			});
			const invoicePayment = invoicePayments.data[0];
			if (!invoicePayment) {
				return null;
			}

			const invoice =
				typeof invoicePayment.invoice === 'string'
					? await this.getStripeClient().invoices.retrieve(invoicePayment.invoice)
					: invoicePayment.invoice;
			if (!invoice || ('deleted' in invoice && invoice.deleted)) {
				return null;
			}

			const subscriptionId = resolveStripeSubscriptionIdFromInvoice(invoice);
			if (!subscriptionId) {
				return null;
			}

			return await this.getStripeClient().subscriptions.retrieve(subscriptionId, {
				expand: ['items.data.price'],
			});
		} catch (error) {
			this.logger.error('Failed to resolve Stripe subscription for charge', {
				chargeId: charge.id,
				paymentIntentId: resolveStripeResourceId(charge.payment_intent),
				error,
			});

			return null;
		}
	}

	private async resolveSubscriptionIdFromInvoiceRef(
		invoiceRef: string | Stripe.Invoice | null | undefined,
	): Promise<string | null> {
		if (!invoiceRef) {
			return null;
		}

		const invoice = typeof invoiceRef === 'string' ? await this.getStripeClient().invoices.retrieve(invoiceRef) : invoiceRef;

		return resolveStripeSubscriptionIdFromInvoice(invoice);
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
