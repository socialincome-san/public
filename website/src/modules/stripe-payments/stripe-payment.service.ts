import {
	ContributionStatus,
	ContributorReferralSource,
	PaymentEventType,
	SubscriptionStatus,
	type CountryCode,
} from '@/generated/prisma/enums';
import {
	cancelStripeSubscription,
	constructStripeWebhookEvent,
	createStripeBillingPortalSession,
	createStripeCheckoutSession,
	createStripeCustomer,
	createStripePrice,
	getStripeBalanceTransaction,
	listOpenStripeInvoices,
	listStripeCheckoutSessionsByPaymentIntent,
	listStripeSubscriptions,
	mapStripeRecurringInterval,
	mapStripeSubscriptionFields,
	mapStripeSubscriptionLifecycle,
	mapStripeSubscriptionPriceFields,
	resolveStripeResourceId,
	resolveStripeSubscriptionCanceledAt,
	retrieveStripeCharge,
	retrieveStripeCheckoutSession,
	retrieveStripeCustomer,
	retrieveStripePaymentMethod,
	retrieveStripeSubscription,
	retrieveStripeSubscriptionForCharge,
	updateStripeSubscription,
	voidStripeInvoice,
	type StripeApiCharge,
	type StripeApiCheckoutSession,
	type StripeApiCustomer,
	type StripeApiEvent,
	type StripeApiPaymentMethod,
	type StripeApiSubscription,
} from '@/integrations/stripe/stripe.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { COUNTRY_CODES } from '@/lib/types/country';
import { isValidCurrency } from '@/lib/types/currency';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { titleCase } from '@/lib/utils/string-utils';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { getCampaignById, getDefaultCampaignForProgram, getFallbackCampaign } from '@/modules/campaigns/campaign.service';
import { upsertFromStripeEvent } from '@/modules/contributions/contribution.service';
import type { PaymentEventCreateData, StripeContributionCreateData } from '@/modules/contributions/contribution.types';
import {
	findContributorByAccountId,
	findContributorByStripeCustomerOrEmail,
	getOrCreateContributorForAccount,
	getOrCreateContributorWithFirebaseAuth,
	updateContributorSelf,
} from '@/modules/contributors/contributor.service';
import type { ContributorWithContact, StripeContributorData } from '@/modules/contributors/contributor.types';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import {
	amountToStripeUnitAmount,
	COVER_TRANSACTION_COSTS_METADATA_KEY,
	getAmountWithTransactionCostCoverage,
	isCoverTransactionCostsAmountInRange,
	isSubscriptionAmountInRange,
	mapCoverTransactionCostsMetadata,
	SUBSCRIPTION_AMOUNT_MAX,
	SUBSCRIPTION_AMOUNT_MIN,
	toCoverTransactionCostsMetadataValue,
} from '@/modules/subscriptions/subscription-amount.service';
import { mapCancellationReasonToStripeFeedback } from '@/modules/subscriptions/subscription-cancellation.service';
import { getUserContactIdByAccountId, getUserStripeCheckoutContext } from '@/modules/users/user.service';
import { canCreatePortalProgramDonation } from './stripe-payment.permissions';
import * as stripePaymentRepository from './stripe-payment.repository';
import {
	APPLY_PAYMENT_METHOD_QUERY_PARAM,
	type ApplyCustomerDefaultPaymentMethodInput,
	type CancelContributorSubscriptionInput,
	type CheckoutMetadata,
	type CreateManageSubscriptionsSessionInput,
	type DonationWizardAmountContext,
	type PortalProgramDonationCheckoutInput,
	type StripeBillingPortalSessionUrl,
	type StripeCheckoutCustomerPrefill,
	type StripeCheckoutOnboardingPrefill,
	type StripeContributorNameParts,
	type StripeEmbeddedCheckoutResult,
	type StripeEmbeddedCheckoutSessionInput,
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
	type UpdateContributorSubscriptionAmountInput,
} from './stripe-payment.types';

const STRIPE_CHECKOUT_SESSION_ID_PARAM = 'donation_checkout_session_id';
const CHECKOUT_SESSION_ID_PLACEHOLDER = '{CHECKOUT_SESSION_ID}';
const DONATION_MONTHLY_INCOME_MIN = 50;
const DONATION_MONTHLY_INCOME_MAX = 1_000_000;
const DONATION_CUSTOM_AMOUNT_MIN = 1;
const DONATION_CUSTOM_AMOUNT_MAX = 1_000_000;

export const createPortalProgramDonationCheckout = async (
	userId: string,
	input: PortalProgramDonationCheckoutInput,
): Promise<ServiceResult<string>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success || !canCreatePortalProgramDonation(accessResult.data, input.programId)) {
			return resultFail('Program not found or access denied');
		}

		const userResult = await getUserStripeCheckoutContext(userId);
		if (!userResult.success) {
			return resultFail(userResult.error);
		}

		const user = userResult.data;
		let stripeCustomerId: string | null = null;
		const contributorResult = await findContributorByAccountId(user.accountId);
		if (!contributorResult.success) {
			return resultFail(contributorResult.error);
		}

		if (contributorResult.data?.stripeCustomerId) {
			stripeCustomerId = contributorResult.data.stripeCustomerId;
		} else {
			const email = user.email;
			if (!email) {
				return resultFail('User contact email is required for portal donations');
			}

			const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined;
			const createCustomerResult = await createStripeCustomer(email, name);
			if (!createCustomerResult.success) {
				return createCustomerResult;
			}

			stripeCustomerId = createCustomerResult.data;
			const createdContributorResult = await getOrCreateContributorForAccount(
				user.accountId,
				stripeCustomerId,
				user.contactId,
			);
			if (!createdContributorResult.success) {
				return resultFail(createdContributorResult.error);
			}
		}

		const campaignResult = await getDefaultCampaignForProgram(input.programId);
		if (!campaignResult.success) {
			return resultFail(campaignResult.error);
		}

		const baseUrl = (process.env.BASE_URL ?? '').replace(TRAILING_SLASHES_REGEX, '');
		const successUrl = `${baseUrl}/portal/programs/${input.programId}/overview?donation=success`;

		return createHostedCheckoutSession({
			amount: input.amount,
			currency: input.currency ?? 'CHF',
			intervalCount: input.intervalCount ?? 1,
			recurring: input.recurring ?? false,
			successUrl,
			campaignId: campaignResult.data.id,
			accountId: user.accountId,
			source: 'portal',
			stripeCustomerId,
			coverTransactionCosts: false,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not create portal donation checkout session');
	}
};

export const createEmbeddedCheckoutSession = async (
	input: StripeEmbeddedCheckoutSessionInput,
): Promise<ServiceResult<StripeEmbeddedCheckoutResult>> => {
	try {
		const resolved = resolveWizardEmbeddedCheckout(input.wizardContext, input.currency);
		if (!resolved.success) {
			return resolved;
		}

		const { unitAmount, recurring, campaignId, currency, coverTransactionCosts } = resolved.data;

		if (campaignId) {
			const campaignResult = await getCampaignById(campaignId);
			if (!campaignResult.success) {
				return resultFail('Invalid campaign');
			}
		}

		const returnUrlResult = resolveEmbeddedCheckoutReturnUrl(input.returnPath);
		if (!returnUrlResult.success) {
			return returnUrlResult;
		}

		const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
		if (!publishableKey) {
			return resultFail('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
		}

		const checkoutResult = await createCheckoutSession({
			amount: unitAmount,
			currency,
			recurring,
			intervalCount: 1,
			returnUrl: returnUrlResult.data,
			stripeCustomerId: input.stripeCustomerId,
			campaignId,
			source: 'donation-wizard',
			coverTransactionCosts,
			uiMode: 'embedded_page',
		});
		if (!checkoutResult.success) {
			return checkoutResult;
		}
		if (!checkoutResult.data.clientSecret) {
			return resultFail('Embedded checkout session has no client secret');
		}

		return resultOk({
			clientSecret: checkoutResult.data.clientSecret,
			sessionId: checkoutResult.data.sessionId,
			publishableKey,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not create embedded checkout session');
	}
};

export const getCheckoutOnboardingPrefill = async (
	sessionId: string,
): Promise<ServiceResult<StripeCheckoutOnboardingPrefill>> => {
	try {
		const sessionResult = await retrieveStripeCheckoutSession(sessionId);
		if (!sessionResult.success) {
			return sessionResult;
		}

		const paidCheck = assertEmbeddedCheckoutSessionPaid(sessionResult.data);
		if (!paidCheck.success) {
			return paidCheck;
		}

		const stripeCustomerId = resolveStripeResourceId(sessionResult.data.customer);
		if (!stripeCustomerId) {
			return resultFail('Checkout session has no Stripe customer');
		}

		const email = sessionResult.data.customer_details?.email ?? undefined;
		const contributorResult = await findContributorByStripeCustomerOrEmail(stripeCustomerId, email);
		if (!contributorResult.success) {
			return contributorResult;
		}

		const prefill = parseCheckoutCustomerDetails(sessionResult.data.customer_details);
		const needsOnboarding = !contributorResult.data || contributorResult.data.needsOnboarding;

		return resultOk({
			...prefill,
			needsOnboarding,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not load checkout onboarding prefill');
	}
};

export const updateContributorAfterCheckout = async (
	input: UpdateContributorAfterCheckoutInput,
): Promise<ServiceResult<UpdateContributorAfterCheckoutResult>> => {
	try {
		const { stripeCheckoutSessionId, user } = input;
		const sessionResult = await retrieveStripeCheckoutSession(stripeCheckoutSessionId);
		if (!sessionResult.success) {
			return sessionResult;
		}

		const paidCheck = assertEmbeddedCheckoutSessionPaid(sessionResult.data);
		if (!paidCheck.success) {
			return paidCheck;
		}

		const stripeCustomerId = resolveStripeResourceId(sessionResult.data.customer);
		if (!stripeCustomerId) {
			return resultFail('Checkout session has no Stripe customer');
		}

		const stripeCustomerResult = await retrieveStripeCustomer(stripeCustomerId);
		if (!stripeCustomerResult.success) {
			return stripeCustomerResult;
		}

		const emailCheck = assertContributorEmailMatchesCheckout(sessionResult.data, user.email);
		if (!emailCheck.success) {
			return emailCheck;
		}

		const contributorEmail = emailCheck.data ?? stripeCustomerResult.data.email ?? null;
		if (!contributorEmail) {
			return resultFail('A contributor email is required');
		}

		const existingResult = await findContributorByStripeCustomerOrEmail(stripeCustomerResult.data.id, contributorEmail);
		if (!existingResult.success) {
			return existingResult;
		}

		let contributor = existingResult.data;
		if (!contributor) {
			const createResult = await getOrCreateContributorWithFirebaseAuth({
				stripeCustomerId: stripeCustomerResult.data.id,
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

		return updateContributorSelf(contributor.id, {
			...(user.personal.referral !== undefined ? { referral: user.personal.referral } : {}),
			needsOnboarding: false,
			contact: {
				firstName: user.personal.name,
				lastName: user.personal.lastname,
				email: contributorEmail,
				gender: user.personal.gender ?? null,
				language: user.language,
				address: {
					country: user.address.country,
				},
			},
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not update contributor after checkout');
	}
};

export const updateContributorReferralAfterCheckout = async (
	input: UpdateContributorReferralAfterCheckoutInput,
): Promise<ServiceResult<UpdateContributorReferralAfterCheckoutResult>> => {
	try {
		const sessionResult = await retrieveStripeCheckoutSession(input.stripeCheckoutSessionId);
		if (!sessionResult.success) {
			return sessionResult;
		}

		const paidCheck = assertEmbeddedCheckoutSessionPaid(sessionResult.data);
		if (!paidCheck.success) {
			return paidCheck;
		}

		const stripeCustomerId = resolveStripeResourceId(sessionResult.data.customer);
		if (!stripeCustomerId) {
			return resultFail('Checkout session has no Stripe customer');
		}

		const email = sessionResult.data.customer_details?.email ?? undefined;
		const existingResult = await findContributorByStripeCustomerOrEmail(stripeCustomerId, email);
		if (!existingResult.success) {
			return existingResult;
		}

		const contributor = existingResult.data;
		if (!contributor) {
			return resultFail('Contributor not found for checkout session');
		}

		const contributorEmail = contributor.contact?.email;
		if (!contributorEmail) {
			return resultFail('Contributor email is required');
		}

		return updateContributorSelf(contributor.id, {
			referral: input.referral,
			contact: {
				email: contributorEmail,
			},
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not update contributor referral after checkout');
	}
};

export const getSubscriptionsTableView = async (
	stripeCustomerId: string | null,
): Promise<ServiceResult<StripeSubscriptionTableView>> => {
	try {
		const paginated = await getPaginatedSubscriptionsTableView(stripeCustomerId, {
			page: 1,
			pageSize: 10_000,
			search: '',
		});
		if (!paginated.success) {
			return resultFail(paginated.error);
		}

		return resultOk({ rows: paginated.data.rows });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch subscriptions table view');
	}
};

export const getPaginatedSubscriptionsTableView = async (
	stripeCustomerId: string | null,
	query: StripeSubscriptionTableQuery,
): Promise<ServiceResult<StripeSubscriptionPaginatedTableView>> => {
	try {
		if (!stripeCustomerId) {
			return resultOk({ rows: [], totalCount: 0 });
		}

		const subscriptionsResult = await listStripeSubscriptions({ customerId: stripeCustomerId, status: 'all' });
		if (!subscriptionsResult.success) {
			return subscriptionsResult;
		}

		const rows: StripeSubscriptionRow[] = await Promise.all(
			subscriptionsResult.data.map(async (subscription) => {
				const item = subscription.items.data[0];
				const price = item?.price;
				const paymentMethod = await resolveSubscriptionPaymentMethod(subscription.default_payment_method);

				return {
					id: subscription.id,
					created: new Date(subscription.start_date * 1000),
					status: subscription.status,
					amount: price?.unit_amount ? price.unit_amount / 100 : 0,
					interval: price?.recurring?.interval_count?.toString() ?? '',
					currency: price?.currency?.toUpperCase() ?? '',
					paymentMethod,
				};
			}),
		);

		const sortedRows = sortSubscriptionRows(rows, query);
		const offset = (query.page - 1) * query.pageSize;

		return resultOk({ rows: sortedRows.slice(offset, offset + query.pageSize), totalCount: sortedRows.length });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch subscriptions');
	}
};

export const createManageSubscriptionsSession = async (
	input: CreateManageSubscriptionsSessionInput,
): Promise<ServiceResult<StripeBillingPortalSessionUrl>> => {
	try {
		if (!input.stripeCustomerId) {
			return resultFail('Missing Stripe customer ID');
		}

		const baseUrl = (process.env.BASE_URL ?? '').replace(TRAILING_SLASHES_REGEX, '');
		const returnUrl = `${baseUrl}/dashboard/subscriptions?${APPLY_PAYMENT_METHOD_QUERY_PARAM}=${encodeURIComponent(input.subscriptionId)}`;

		return createStripeBillingPortalSession({
			customerId: input.stripeCustomerId,
			returnUrl,
			locale: input.language,
			flow: input.flow,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not create billing portal session');
	}
};

export const applyCustomerDefaultPaymentMethodToOwnedSubscription = async (
	input: ApplyCustomerDefaultPaymentMethodInput,
): Promise<ServiceResult<void>> => {
	try {
		if (!input.stripeCustomerId) {
			return resultFail('Missing Stripe customer ID');
		}

		const subscription = await stripePaymentRepository.findOwnedActiveStripeSubscription(
			input.contributorId,
			input.subscriptionId,
		);
		if (!subscription) {
			return resultFail('Subscription not found');
		}

		const customerResult = await retrieveStripeCustomer(input.stripeCustomerId);
		if (!customerResult.success) {
			return customerResult;
		}

		return copyCustomerDefaultPaymentMethodToSubscriptions(customerResult.data);
	} catch (error) {
		console.error(error);

		return resultFail('Could not apply default payment method to subscription');
	}
};

export const updateContributorSubscriptionAmount = async (
	input: UpdateContributorSubscriptionAmountInput,
): Promise<ServiceResult<{ amount: number; currency: string }>> => {
	try {
		const { contributorId, subscriptionId, amount, coverTransactionCosts } = input;
		if (!isSubscriptionAmountInRange(amount)) {
			return resultFail(`Amount must be an integer between ${SUBSCRIPTION_AMOUNT_MIN} and ${SUBSCRIPTION_AMOUNT_MAX}`);
		}

		const subscription = await stripePaymentRepository.findOwnedActiveStripeSubscription(contributorId, subscriptionId);
		if (!subscription?.stripeSubscriptionId) {
			return resultFail('Subscription not found');
		}

		const chargeAmount = coverTransactionCosts ? getAmountWithTransactionCostCoverage(amount) : amount;
		if (coverTransactionCosts === true && !isCoverTransactionCostsAmountInRange(chargeAmount)) {
			return resultFail(`Amount must be between ${SUBSCRIPTION_AMOUNT_MIN} and ${SUBSCRIPTION_AMOUNT_MAX}`);
		}

		const updateResult = await updateStripeSubscriptionUnitAmount({
			stripeSubscriptionId: subscription.stripeSubscriptionId,
			expectedCurrency: subscription.currency,
			unitAmount: amountToStripeUnitAmount(chargeAmount),
			metadata:
				coverTransactionCosts === undefined
					? undefined
					: {
							[COVER_TRANSACTION_COSTS_METADATA_KEY]: toCoverTransactionCostsMetadataValue(coverTransactionCosts),
						},
		});
		if (!updateResult.success) {
			return updateResult;
		}

		const upsertResult = await syncStripeSubscriptionAmount({
			stripeSubscription: updateResult.data,
			contributorId,
			campaignId: subscription.campaignId,
			subscriptionId,
			stripeSubscriptionId: subscription.stripeSubscriptionId,
		});
		if (!upsertResult.success) {
			return resultFail(upsertResult.error);
		}

		return resultOk({ amount: chargeAmount, currency: subscription.currency });
	} catch (error) {
		console.error(error);

		return resultFail('Could not update subscription amount');
	}
};

export const cancelContributorSubscription = async (
	input: CancelContributorSubscriptionInput,
): Promise<ServiceResult<void>> => {
	try {
		const subscription = await stripePaymentRepository.findOwnedStripeSubscription(
			input.contributorId,
			input.subscriptionId,
		);
		if (!subscription?.stripeSubscriptionId) {
			return resultFail('Subscription not found');
		}
		if (subscription.status === SubscriptionStatus.ended) {
			return resultFail('Subscription not found');
		}

		const retrieveResult = await retrieveStripeSubscription(subscription.stripeSubscriptionId);
		if (!retrieveResult.success) {
			return resultFail('Could not cancel subscription');
		}
		if (!retrieveResult.data) {
			return resultFail('Subscription not found');
		}

		let stripeSubscription = retrieveResult.data;
		if (stripeSubscription.status !== 'canceled') {
			await voidOpenSubscriptionInvoices(subscription.stripeSubscriptionId);
			const cancelResult = await cancelStripeSubscription(
				subscription.stripeSubscriptionId,
				mapCancellationReasonToStripeFeedback(input.reason),
			);
			if (!cancelResult.success) {
				return cancelResult;
			}
			stripeSubscription = cancelResult.data;
		}

		const lifecycle = mapStripeSubscriptionLifecycle(stripeSubscription);

		try {
			await stripePaymentRepository.updateOwnedStripeSubscriptionCancellation({
				id: subscription.id,
				status: lifecycle?.status ?? SubscriptionStatus.ended,
				canceledAt: lifecycle?.canceledAt ?? resolveStripeSubscriptionCanceledAt(stripeSubscription),
				cancellationReason: input.reason,
			});
		} catch (error) {
			console.error(`${SLACK_ALERT}: Stripe canceled the subscription but database update failed`, {
				subscriptionId: subscription.id,
				stripeSubscriptionId: subscription.stripeSubscriptionId,
				error,
			});

			return resultFail('Could not cancel subscription');
		}

		return resultOk(undefined);
	} catch (error) {
		console.error(error);

		return resultFail('Could not cancel subscription');
	}
};

export const handleWebhookEvent = async (
	body: string,
	signature: string,
	webhookSecret: string,
): Promise<ServiceResult<StripeWebhookResult>> => {
	try {
		const eventResult = constructStripeWebhookEvent(body, signature, webhookSecret);
		if (!eventResult.success) {
			return eventResult;
		}

		return processWebhookEvent(eventResult.data);
	} catch (error) {
		console.error(`${SLACK_ALERT}: Stripe webhook handler failed`, { error });

		return resultFail('Failed to handle webhook event');
	}
};

export const getSubscriptionStripeDetails = async (
	stripeSubscriptionId: string,
): Promise<ServiceResult<StripeSubscriptionDetails | null>> => {
	try {
		const subscriptionResult = await retrieveStripeSubscription(stripeSubscriptionId, ['default_payment_method']);
		if (!subscriptionResult.success) {
			console.warn('Could not retrieve Stripe subscription details', { stripeSubscriptionId });

			return resultOk(null);
		}
		if (!subscriptionResult.data) {
			return resultOk(null);
		}

		const subscription = subscriptionResult.data;
		const firstItem = subscription.items.data[0];
		const currentPeriodEnd =
			typeof firstItem?.current_period_end === 'number' ? new Date(firstItem.current_period_end * 1000) : null;
		const paymentMethod = subscription.default_payment_method;
		const card =
			paymentMethod && typeof paymentMethod !== 'string' && paymentMethod.type === 'card' ? paymentMethod.card : null;

		if (!card) {
			return resultOk({ currentPeriodEnd });
		}

		return resultOk({
			brand: titleCase(card.brand),
			last4: card.last4,
			currentPeriodEnd,
		});
	} catch (error) {
		console.warn('Could not retrieve Stripe subscription details', { stripeSubscriptionId, error });

		return resultOk(null);
	}
};

const processWebhookEvent = async (event: StripeApiEvent): Promise<ServiceResult<StripeWebhookResult>> => {
	switch (event.type) {
		case 'charge.succeeded':
		case 'charge.updated':
		case 'charge.failed': {
			const charge = event.data.object;
			console.info('Processing charge event', { eventType: event.type, chargeId: charge.id });
			const result = await processChargeEvent(charge);
			if (!result.success) {
				console.error(`${SLACK_ALERT}: Stripe charge event processing failed: ${result.error}`, {
					eventType: event.type,
					chargeId: charge.id,
				});

				return resultFail(result.error);
			}
			if (result.data.contributionId) {
				console.info('Successfully processed charge', { chargeId: charge.id });
			}

			return resultOk(result.data);
		}
		case 'customer.updated': {
			const customer = event.data.object;
			const previousInvoiceSettings = event.data.previous_attributes?.invoice_settings;
			if (!previousInvoiceSettings || !('default_payment_method' in previousInvoiceSettings)) {
				return resultOk({ skipReason: 'Customer default payment method unchanged' });
			}
			if (customer.deleted) {
				return resultOk({ skipReason: 'Stripe customer is deleted' });
			}

			console.info('Processing customer default payment method update', { customerId: customer.id });
			const result = await copyCustomerDefaultPaymentMethodToSubscriptions(customer);
			if (!result.success) {
				console.error(`${SLACK_ALERT}: Stripe customer payment method sync failed: ${result.error}`, {
					customerId: customer.id,
				});

				return resultFail(result.error);
			}

			return resultOk({});
		}
		case 'customer.subscription.created':
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted': {
			const subscription = event.data.object;
			console.info('Processing subscription event', {
				eventType: event.type,
				subscriptionId: subscription.id,
			});
			const result = await processSubscriptionEvent(subscription);
			if (!result.success) {
				console.error(`${SLACK_ALERT}: Stripe subscription event processing failed: ${result.error}`, {
					eventType: event.type,
					subscriptionId: subscription.id,
				});

				return resultFail(result.error);
			}

			return resultOk(result.data);
		}
		default:
			return resultOk({ skipReason: `Unhandled event type: ${event.type}` });
	}
};

const processChargeEvent = async (charge: StripeApiCharge): Promise<ServiceResult<StripeWebhookResult>> => {
	try {
		const fullChargeResult = await retrieveStripeCharge(charge.id);
		if (!fullChargeResult.success) {
			return fullChargeResult;
		}

		const fullCharge = fullChargeResult.data;
		const customerId = fullCharge.customer;
		if (!customerId || typeof customerId !== 'string') {
			return resultFail('Charge has no Stripe customer');
		}

		const stripeCustomerResult = await retrieveStripeCustomer(customerId);
		if (!stripeCustomerResult.success) {
			return stripeCustomerResult;
		}

		const stripeCustomer = stripeCustomerResult.data;
		const checkoutMetadata = await getCheckoutMetadata(fullCharge);
		const contributorResult = await resolveContributorForCharge(fullCharge, stripeCustomer, checkoutMetadata);
		if (!contributorResult.success) {
			return contributorResult;
		}
		if (!contributorResult.data.contributor) {
			return resultOk({ skipReason: contributorResult.data.skipReason });
		}

		const { contributor, isNewContributor } = contributorResult.data;
		let campaignId = checkoutMetadata?.campaignId;
		if (!campaignId) {
			const fallbackCampaignResult = await getFallbackCampaign();
			if (!fallbackCampaignResult.success) {
				console.error(fallbackCampaignResult.error);

				return resultFail(fallbackCampaignResult.error);
			}
			campaignId = fallbackCampaignResult.data.id;
		}

		const stripeSubscriptionResult = await retrieveStripeSubscriptionForCharge(fullCharge);
		if (!stripeSubscriptionResult.success) {
			return stripeSubscriptionResult;
		}

		const stripeSubscription = stripeSubscriptionResult.data;
		if (stripeSubscription) {
			const metadataCampaignId = await resolveExistingCampaignId(stripeSubscription.metadata?.campaignId);
			if (metadataCampaignId) {
				campaignId = metadataCampaignId;
			}

			const subscriptionResult = await syncMappedStripeSubscription({
				stripeSubscription,
				contributorId: contributor.id,
				campaignId,
			});
			if (!subscriptionResult.success) {
				console.error('Subscription upsert failed; continuing with contribution write', {
					chargeId: fullCharge.id,
					stripeSubscriptionId: stripeSubscription.id,
					error: subscriptionResult.error,
				});
			} else if (!subscriptionResult.data) {
				console.warn('Could not map Stripe subscription for charge; continuing with contribution write', {
					chargeId: fullCharge.id,
					stripeSubscriptionId: stripeSubscription.id,
					status: stripeSubscription.status,
				});
			}
		}

		const chargeCurrency = fullCharge.currency.toUpperCase();
		if (!isValidCurrency(chargeCurrency)) {
			return resultFail(`Unsupported currency from Stripe charge: ${fullCharge.currency}`);
		}

		const contributionData: StripeContributionCreateData = {
			contributorId: contributor.id,
			amount: fullCharge.amount / 100,
			currency: chargeCurrency,
			amountChf: extractAmountChf(fullCharge),
			feesChf: extractFeesChf(fullCharge),
			status: constructContributionStatus(fullCharge.status),
			campaignId,
			createdAt: new Date(fullCharge.created * 1000),
		};
		const balanceTransaction = getStripeBalanceTransaction(fullCharge.balance_transaction);
		const paymentEventData: PaymentEventCreateData = {
			type: PaymentEventType.stripe,
			transactionId: fullCharge.id,
			metadata: {
				chargeId: fullCharge.id,
				customerId: fullCharge.customer,
				paymentIntentId: fullCharge.payment_intent,
				balanceTransactionId: balanceTransaction?.id,
			},
		};
		const contributionResult = await upsertFromStripeEvent(contributionData, paymentEventData);
		if (!contributionResult.success) {
			console.error(contributionResult.error);

			return resultFail(contributionResult.error);
		}

		console.info('Created contribution', { contributionId: contributionResult.data.id });

		return resultOk({
			contributionId: contributionResult.data.id,
			contributorId: contributor.id,
			isNewContributor,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Failed to process charge');
	}
};

const processSubscriptionEvent = async (
	subscription: StripeApiSubscription,
): Promise<ServiceResult<StripeWebhookResult>> => {
	try {
		const customerId = resolveStripeResourceId(subscription.customer);
		if (!customerId) {
			return resultOk({ skipReason: `Subscription ${subscription.id} has no customer` });
		}

		const contributorResult = await findContributorByStripeCustomerOrEmail(customerId);
		if (!contributorResult.success) {
			return resultFail(contributorResult.error);
		}
		if (!contributorResult.data) {
			console.info('Skipping subscription event for unknown contributor', {
				subscriptionId: subscription.id,
				customerId,
			});

			return resultOk({ skipReason: 'No contributor for Stripe customer' });
		}

		let campaignId = await resolveExistingCampaignId(subscription.metadata?.campaignId);
		if (!campaignId) {
			const existing = await stripePaymentRepository.findStripeSubscriptionByStripeId(subscription.id);
			campaignId = existing?.campaignId;
		}
		if (!campaignId) {
			const fallbackCampaignResult = await getFallbackCampaign();
			if (!fallbackCampaignResult.success) {
				return resultFail(fallbackCampaignResult.error);
			}
			campaignId = fallbackCampaignResult.data.id;
		}

		const upsertResult = await syncFromStripeSubscriptionEvent({
			stripeSubscription: subscription,
			contributorId: contributorResult.data.id,
			campaignId,
		});
		if (!upsertResult.success) {
			return resultFail(upsertResult.error);
		}
		if (!upsertResult.data) {
			return resultOk({
				skipReason: `Could not sync Stripe subscription ${subscription.id}`,
			});
		}

		return resultOk({
			contributorId: contributorResult.data.id,
			isNewContributor: false,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Failed to process subscription event');
	}
};

const resolveContributorForCharge = async (
	fullCharge: StripeApiCharge,
	stripeCustomer: StripeApiCustomer,
	checkoutMetadata: CheckoutMetadata | null,
): Promise<
	ServiceResult<
		| { contributor: ContributorWithContact; isNewContributor: boolean; skipReason?: undefined }
		| { skipReason: string; contributor?: undefined; isNewContributor?: undefined }
	>
> => {
	const accountId = checkoutMetadata?.accountId;
	if (accountId) {
		const contactIdResult = await getUserContactIdByAccountId(accountId);
		if (!contactIdResult.success) {
			return resultFail(contactIdResult.error);
		}
		if (contactIdResult.data) {
			const portalResult = await getOrCreateContributorForAccount(accountId, stripeCustomer.id, contactIdResult.data);
			if (!portalResult.success) {
				console.error(portalResult.error);

				return resultFail(portalResult.error);
			}
			if (portalResult.data.isNewContributor) {
				console.info('Created new contributor (portal)', { contributorId: portalResult.data.contributor.id });
			}

			return resultOk(portalResult.data);
		}
	}

	if (fullCharge.status === 'succeeded') {
		const { firstName, lastName } = splitContributorName(stripeCustomer.name);
		const contributorData: StripeContributorData = {
			stripeCustomerId: stripeCustomer.id,
			email: stripeCustomer.email ?? '',
			firstName,
			lastName,
			referral: ContributorReferralSource.other,
		};
		const contributorResult = await getOrCreateContributorWithFirebaseAuth(contributorData);
		if (!contributorResult.success) {
			console.error(contributorResult.error);

			return resultFail(contributorResult.error);
		}
		if (contributorResult.data.isNewContributor) {
			console.info('Created new contributor', { contributorId: contributorResult.data.contributor.id });
		}

		return resultOk(contributorResult.data);
	}

	const existingContributorResult = await findContributorByStripeCustomerOrEmail(
		stripeCustomer.id,
		stripeCustomer.email && stripeCustomer.email.length > 0 ? stripeCustomer.email : undefined,
	);
	if (!existingContributorResult.success) {
		console.error(existingContributorResult.error);

		return resultFail(existingContributorResult.error);
	}
	if (!existingContributorResult.data) {
		console.info('Skipping non-successful charge for non-existent contributor');

		return resultOk({ skipReason: 'Non-successful charge with no existing contributor' });
	}

	return resultOk({ contributor: existingContributorResult.data, isNewContributor: false });
};

const resolveExistingCampaignId = async (campaignId: string | undefined): Promise<string | undefined> => {
	if (!campaignId) {
		return undefined;
	}

	const campaignResult = await getCampaignById(campaignId);
	if (!campaignResult.success) {
		return undefined;
	}

	return campaignResult.data.id;
};

const syncStripeSubscriptionAmount = async (input: {
	stripeSubscription: StripeApiSubscription;
	contributorId: string;
	campaignId: string;
	subscriptionId: string;
	stripeSubscriptionId: string;
}): Promise<ServiceResult<void>> => {
	const upsertResult = await syncMappedStripeSubscription(input);
	if (!upsertResult.success || !upsertResult.data) {
		console.error(`${SLACK_ALERT}: Stripe subscription amount updated but database sync failed`, {
			subscriptionId: input.subscriptionId,
			stripeSubscriptionId: input.stripeSubscriptionId,
			error: upsertResult.success ? 'Could not sync updated subscription' : upsertResult.error,
		});

		return resultFail('Could not sync updated subscription');
	}

	return resultOk(undefined);
};

const syncMappedStripeSubscription = async (input: {
	stripeSubscription: StripeApiSubscription;
	contributorId: string;
	campaignId: string;
}): Promise<ServiceResult<{ id: string } | null>> => {
	const mapped = mapStripeSubscriptionFields(input.stripeSubscription);
	if (!mapped) {
		return resultOk(null);
	}

	try {
		const subscription = await stripePaymentRepository.updateStripeSubscriptionFromStripe({
			stripeSubscriptionId: input.stripeSubscription.id,
			contributorId: input.contributorId,
			campaignId: input.campaignId,
			amount: mapped.amount,
			currency: mapped.currency,
			interval: mapped.interval,
			status: mapped.status,
			canceledAt: mapped.canceledAt,
			coverTransactionCosts: mapCoverTransactionCostsMetadata(input.stripeSubscription.metadata),
		});

		return resultOk({ id: subscription.id });
	} catch (error) {
		console.error(error);

		return resultFail('Could not upsert Stripe subscription');
	}
};

const syncFromStripeSubscriptionEvent = async (input: {
	stripeSubscription: StripeApiSubscription;
	contributorId: string;
	campaignId: string;
}): Promise<ServiceResult<{ id: string } | null>> => {
	const lifecycle = mapStripeSubscriptionLifecycle(input.stripeSubscription);
	if (!lifecycle) {
		return resultOk(null);
	}

	const priceFields = mapStripeSubscriptionPriceFields(input.stripeSubscription);
	if (priceFields) {
		return syncMappedStripeSubscription(input);
	}

	try {
		const existing = await stripePaymentRepository.findStripeSubscriptionByStripeId(input.stripeSubscription.id);
		if (!existing) {
			console.warn('Cannot create Stripe subscription without price fields on lifecycle event', {
				stripeSubscriptionId: input.stripeSubscription.id,
				status: input.stripeSubscription.status,
			});

			return resultOk(null);
		}

		const subscription = await stripePaymentRepository.updateStripeSubscriptionLifecycle({
			id: existing.id,
			status: lifecycle.status,
			canceledAt: lifecycle.canceledAt,
		});

		return resultOk({ id: subscription.id });
	} catch (error) {
		console.error(error);

		return resultFail('Could not sync Stripe subscription lifecycle');
	}
};

const updateStripeSubscriptionUnitAmount = async (input: {
	stripeSubscriptionId: string;
	expectedCurrency: string;
	unitAmount: number;
	metadata?: Record<string, string>;
}): Promise<ServiceResult<StripeApiSubscription>> => {
	const retrieveResult = await retrieveStripeSubscription(input.stripeSubscriptionId);
	if (!retrieveResult.success) {
		return retrieveResult;
	}
	if (!retrieveResult.data) {
		return resultFail('Stripe subscription not found');
	}

	const stripeSubscription = retrieveResult.data;
	const item = stripeSubscription.items.data[0];
	if (!item) {
		return resultFail('Stripe subscription has no items');
	}

	const existingPrice = item.price;
	const productId = resolveStripeResourceId(existingPrice.product);
	if (!productId) {
		return resultFail('Stripe subscription item has no product');
	}

	const recurring = existingPrice.recurring;
	if (!recurring || !mapStripeRecurringInterval(recurring.interval, recurring.interval_count)) {
		return resultFail('Only monthly Stripe subscriptions can be updated');
	}

	const stripeCurrency = existingPrice.currency.toLowerCase();
	if (stripeCurrency !== input.expectedCurrency.toLowerCase()) {
		return resultFail('Subscription currency does not match Stripe price');
	}

	const metadata = input.metadata ? { ...stripeSubscription.metadata, ...input.metadata } : undefined;
	const priceChanged = existingPrice.unit_amount !== input.unitAmount;
	if (!priceChanged && !metadata) {
		return resultOk(stripeSubscription);
	}

	if (priceChanged) {
		const priceResult = await createStripePrice({
			currency: stripeCurrency,
			productId,
			unitAmount: input.unitAmount,
		});
		if (!priceResult.success) {
			return priceResult;
		}

		return updateStripeSubscription(input.stripeSubscriptionId, {
			items: [{ id: item.id, price: priceResult.data.id }],
			prorationBehavior: 'none',
			...(metadata ? { metadata } : {}),
		});
	}

	return updateStripeSubscription(input.stripeSubscriptionId, {
		...(metadata ? { metadata } : {}),
	});
};

const copyCustomerDefaultPaymentMethodToSubscriptions = async (
	customer: StripeApiCustomer,
): Promise<ServiceResult<void>> => {
	try {
		const defaultPaymentMethodId = resolveStripeResourceId(customer.invoice_settings.default_payment_method);
		if (!defaultPaymentMethodId) {
			return resultOk(undefined);
		}

		const subscriptionsResult = await listStripeSubscriptions({ customerId: customer.id, limit: 100 });
		if (!subscriptionsResult.success) {
			return resultFail('Could not copy default payment method to subscriptions');
		}

		for (const subscription of subscriptionsResult.data) {
			const currentPaymentMethodId = resolveStripeResourceId(subscription.default_payment_method);
			if (currentPaymentMethodId === defaultPaymentMethodId) {
				continue;
			}

			const updateResult = await updateStripeSubscription(subscription.id, {
				defaultPaymentMethod: defaultPaymentMethodId,
			});
			if (!updateResult.success) {
				return resultFail('Could not copy default payment method to subscriptions');
			}
		}

		return resultOk(undefined);
	} catch (error) {
		console.error(error);

		return resultFail('Could not copy default payment method to subscriptions');
	}
};

const voidOpenSubscriptionInvoices = async (stripeSubscriptionId: string): Promise<void> => {
	const invoicesResult = await listOpenStripeInvoices(stripeSubscriptionId);
	if (!invoicesResult.success) {
		return;
	}

	for (const invoice of invoicesResult.data) {
		await voidStripeInvoice(invoice.id);
	}
};

const resolveEmbeddedCheckoutReturnUrl = (returnPath: string | undefined): ServiceResult<string | undefined> => {
	if (!returnPath) {
		return resultOk(undefined);
	}
	if (!returnPath.startsWith('/') || returnPath.startsWith('//')) {
		return resultFail('Invalid Stripe checkout return path');
	}

	const baseUrl = process.env.BASE_URL?.replace(TRAILING_SLASHES_REGEX, '');
	if (!baseUrl) {
		return resultFail('Missing BASE_URL');
	}

	const url = new URL(returnPath, baseUrl);
	url.search = '';
	url.searchParams.set(STRIPE_CHECKOUT_SESSION_ID_PARAM, CHECKOUT_SESSION_ID_PLACEHOLDER);

	return resultOk(
		url.toString().replace(encodeURIComponent(CHECKOUT_SESSION_ID_PLACEHOLDER), CHECKOUT_SESSION_ID_PLACEHOLDER),
	);
};

const createHostedCheckoutSession = async (input: {
	amount: number;
	successUrl: string;
	currency: string;
	intervalCount: number;
	recurring: boolean;
	campaignId?: string;
	accountId?: string;
	source?: string;
	stripeCustomerId?: string | null;
	coverTransactionCosts?: boolean;
}): Promise<ServiceResult<string>> => {
	const checkoutResult = await createCheckoutSession({
		...input,
		successUrl: input.successUrl,
	});
	if (!checkoutResult.success) {
		return checkoutResult;
	}
	if (!checkoutResult.data.url) {
		return resultFail('Hosted checkout session has no redirect URL');
	}

	return resultOk(checkoutResult.data.url);
};

const createCheckoutSession = async (input: {
	amount: number;
	currency: string;
	recurring: boolean;
	intervalCount: number;
	returnUrl?: string;
	successUrl?: string;
	stripeCustomerId?: string | null;
	campaignId?: string;
	accountId?: string;
	source?: string;
	coverTransactionCosts?: boolean;
	uiMode?: 'embedded_page';
}): Promise<ServiceResult<{ sessionId: string; clientSecret: string | null; url: string | null }>> => {
	const productId = input.recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME;
	if (!productId) {
		return resultFail(input.recurring ? 'Missing STRIPE_PRODUCT_RECURRING' : 'Missing STRIPE_PRODUCT_ONETIME');
	}

	const result = await createStripeCheckoutSession({
		mode: input.recurring ? 'subscription' : 'payment',
		uiMode: input.uiMode,
		customerId: input.stripeCustomerId ?? undefined,
		createCustomerIfMissing: !input.stripeCustomerId && !input.recurring,
		currency: input.currency,
		unitAmount: input.amount,
		productId,
		recurringIntervalCount: input.recurring ? input.intervalCount : undefined,
		returnUrl: input.returnUrl,
		successUrl: input.successUrl,
		metadata: buildCheckoutSessionMetadata({
			campaignId: input.campaignId,
			accountId: input.accountId,
			source: input.source,
			coverTransactionCosts: input.coverTransactionCosts,
		}),
		subscriptionMetadata: input.recurring
			? buildSubscriptionCheckoutMetadata({
					campaignId: input.campaignId,
					coverTransactionCosts: input.coverTransactionCosts,
				})
			: undefined,
	});
	if (!result.success) {
		return result;
	}

	return resultOk({
		sessionId: result.data.id,
		clientSecret: result.data.clientSecret,
		url: result.data.url,
	});
};

const resolveSubscriptionPaymentMethod = async (
	defaultPaymentMethod: StripeApiSubscription['default_payment_method'],
): Promise<StripePaymentMethod> => {
	if (defaultPaymentMethod && typeof defaultPaymentMethod !== 'string') {
		return mapPaymentMethod(defaultPaymentMethod);
	}
	if (typeof defaultPaymentMethod !== 'string' || defaultPaymentMethod.trim() === '') {
		return { type: 'other', label: 'Unknown' };
	}

	const methodResult = await retrieveStripePaymentMethod(defaultPaymentMethod);
	if (!methodResult.success || !methodResult.data) {
		return { type: 'other', label: 'Unknown' };
	}

	return mapPaymentMethod(methodResult.data);
};

const mapPaymentMethod = (paymentMethod: StripeApiPaymentMethod): StripePaymentMethod => {
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
};

const sortSubscriptionRows = (
	rows: StripeSubscriptionRow[],
	query: StripeSubscriptionTableQuery,
): StripeSubscriptionRow[] => {
	const direction = query.sortDirection === 'asc' ? 1 : -1;
	const sortedRows = [...rows];
	const sortBy = toSortKey(query.sortBy, ['created', 'status', 'interval', 'paymentMethod', 'amount'] as const);
	sortedRows.sort((left, right) => {
		switch (sortBy) {
			case 'created':
				return (left.created.getTime() - right.created.getTime()) * direction;
			case 'status':
				return left.status.localeCompare(right.status) * direction;
			case 'interval':
				return left.interval.localeCompare(right.interval) * direction;
			case 'paymentMethod':
				return left.paymentMethod.label.localeCompare(right.paymentMethod.label) * direction;
			case 'amount':
				return (left.amount - right.amount) * direction;
			default:
				return right.created.getTime() - left.created.getTime();
		}
	});

	return sortedRows;
};

const getCheckoutMetadata = async (charge: StripeApiCharge): Promise<CheckoutMetadata | null> => {
	try {
		const paymentIntentId = resolveStripeResourceId(charge.payment_intent);
		if (!paymentIntentId) {
			return null;
		}

		const sessionsResult = await listStripeCheckoutSessionsByPaymentIntent(paymentIntentId);
		if (!sessionsResult.success) {
			return null;
		}

		const metadata = sessionsResult.data[0]?.metadata;
		if (!metadata) {
			return null;
		}

		return {
			campaignId: metadata.campaignId,
			accountId: metadata.accountId,
			source: metadata.source,
			coverTransactionCosts: metadata.coverTransactionCosts,
		};
	} catch (error) {
		console.error(error);

		return null;
	}
};

const extractAmountChf = (charge: StripeApiCharge): number => {
	const balanceTransaction = getStripeBalanceTransaction(charge.balance_transaction);

	return balanceTransaction?.amount ? balanceTransaction.amount / 100 : 0;
};

const extractFeesChf = (charge: StripeApiCharge): number => {
	const balanceTransaction = getStripeBalanceTransaction(charge.balance_transaction);

	return balanceTransaction?.fee ? balanceTransaction.fee / 100 : 0;
};

const constructContributionStatus = (status: StripeApiCharge['status']): ContributionStatus => {
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
};

const splitContributorName = (fullName?: string | null): StripeContributorNameParts => {
	if (!fullName) {
		return { firstName: 'Unknown', lastName: '' };
	}

	const parts = fullName.trim().split(' ');
	if (parts.length === 1) {
		return { firstName: parts[0] ?? 'Unknown', lastName: '' };
	}

	return {
		firstName: parts[0] ?? 'Unknown',
		lastName: parts.slice(1).join(' '),
	};
};

const assertEmbeddedCheckoutSessionPaid = (session: StripeApiCheckoutSession): ServiceResult<void> => {
	if (session.ui_mode !== 'embedded_page') {
		return resultFail('Invalid checkout session type');
	}
	if (session.status !== 'complete') {
		return resultFail('Checkout session is not complete');
	}
	if (session.payment_status !== 'paid') {
		return resultFail('Checkout session is not paid');
	}

	return resultOk(undefined);
};

const normalizeCheckoutEmail = (email: string): string => email.trim().toLowerCase();

const assertContributorEmailMatchesCheckout = (
	session: StripeApiCheckoutSession,
	userEmail: string,
): ServiceResult<string> => {
	const sessionEmail = session.customer_details?.email;
	if (!sessionEmail) {
		return resultOk(normalizeCheckoutEmail(userEmail));
	}

	const normalizedSessionEmail = normalizeCheckoutEmail(sessionEmail);
	const normalizedUserEmail = normalizeCheckoutEmail(userEmail);
	if (normalizedSessionEmail !== normalizedUserEmail) {
		return resultFail('Email does not match checkout session');
	}

	return resultOk(normalizedUserEmail);
};

const isCountryCode = (value: string): value is CountryCode => COUNTRY_CODES.some((code) => code === value);

const parseCheckoutCustomerDetails = (
	details: StripeApiCheckoutSession['customer_details'] | undefined,
): StripeCheckoutCustomerPrefill => {
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
	const country = countryRaw && isCountryCode(countryRaw) ? countryRaw : undefined;

	return { email, firstname, lastname, country };
};

const resolveWizardEmbeddedCheckout = (
	context: DonationWizardAmountContext,
	currency?: string,
): ServiceResult<{
	unitAmount: number;
	recurring: boolean;
	campaignId?: string;
	currency: string;
	coverTransactionCosts: boolean;
}> => {
	if (context.paymentMethod !== 'online') {
		return resultFail('Embedded checkout requires online payment');
	}
	if (!isDonationAmountValid(context)) {
		return resultFail('Invalid donation amount');
	}

	const currencyCode = (currency ?? 'CHF').toUpperCase();
	if (!isValidCurrency(currencyCode)) {
		return resultFail(`Unsupported currency: ${currency ?? ''}`);
	}

	const displayAmount = getDonationDisplayAmount(context);
	const unitAmount = Math.round(displayAmount * 100);
	if (unitAmount < DONATION_CUSTOM_AMOUNT_MIN * 100 || unitAmount > DONATION_CUSTOM_AMOUNT_MAX * 100) {
		return resultFail('Donation amount is out of allowed range');
	}

	return resultOk({
		unitAmount,
		recurring: context.cadence === 'monthly',
		campaignId: context.campaignId,
		currency: currencyCode,
		coverTransactionCosts: context.coverTransactionCosts,
	});
};

const resolveDonationAmount = (context: DonationWizardAmountContext): number | null => {
	if (context.selectedAmount === 'other') {
		if (
			context.customAmount === null ||
			context.customAmount < DONATION_CUSTOM_AMOUNT_MIN ||
			context.customAmount > DONATION_CUSTOM_AMOUNT_MAX
		) {
			return null;
		}

		return context.customAmount;
	}
	if (context.selectedAmount !== null) {
		return context.selectedAmount;
	}
	if (
		context.monthlyIncome !== null &&
		context.monthlyIncome >= DONATION_MONTHLY_INCOME_MIN &&
		context.monthlyIncome <= DONATION_MONTHLY_INCOME_MAX
	) {
		return Math.round(context.monthlyIncome / 100);
	}

	return null;
};

const isDonationAmountValid = (context: DonationWizardAmountContext): boolean => resolveDonationAmount(context) !== null;

const getDonationDisplayAmount = (context: DonationWizardAmountContext): number => {
	const resolved = resolveDonationAmount(context) ?? 0;
	const monthlyBase = context.chargeMonthlyHalfOfOneTimeAmount ? Math.max(1, Math.round(resolved / 2)) : resolved;
	const baseAmount =
		context.cadence === 'monthly' ? (context.selectedTier === '2x' ? monthlyBase * 2 : monthlyBase) : resolved;

	if (context.paymentMethod === 'online' && context.coverTransactionCosts) {
		return getAmountWithTransactionCostCoverage(baseAmount);
	}

	return baseAmount;
};

const applyCoverTransactionCostsMetadata = (
	metadata: Record<string, string>,
	coverTransactionCosts?: boolean,
): Record<string, string> => {
	if (coverTransactionCosts !== undefined) {
		metadata[COVER_TRANSACTION_COSTS_METADATA_KEY] = toCoverTransactionCostsMetadataValue(coverTransactionCosts);
	}

	return metadata;
};

const buildCheckoutSessionMetadata = (input: {
	campaignId?: string;
	accountId?: string;
	source?: string;
	coverTransactionCosts?: boolean;
}): Record<string, string> => {
	const metadata: Record<string, string> = {};
	if (input.campaignId) {
		metadata.campaignId = input.campaignId;
	}
	if (input.accountId) {
		metadata.accountId = input.accountId;
	}
	if (input.source) {
		metadata.source = input.source;
	}

	return applyCoverTransactionCostsMetadata(metadata, input.coverTransactionCosts);
};

const buildSubscriptionCheckoutMetadata = (input: {
	campaignId?: string;
	coverTransactionCosts?: boolean;
}): Record<string, string> => {
	const metadata: Record<string, string> = {};
	if (input.campaignId) {
		metadata.campaignId = input.campaignId;
	}

	return applyCoverTransactionCostsMetadata(metadata, input.coverTransactionCosts);
};
