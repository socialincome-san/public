import { Currency, DonationInterval, SubscriptionStatus } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { isValidCurrency } from '@/lib/types/currency';
import Stripe from 'stripe';

export type StripeApiCheckoutSession = Stripe.Checkout.Session;
export type StripeApiCustomer = Stripe.Customer;
export type StripeApiCharge = Stripe.Charge;
export type StripeApiSubscription = Stripe.Subscription;
export type StripeApiPaymentMethod = Stripe.PaymentMethod;
export type StripeApiInvoice = Stripe.Invoice;
export type StripeApiEvent = Stripe.Event;
export type StripeApiPrice = Stripe.Price;

export type StripeCheckoutCreateInput = {
	mode: 'subscription' | 'payment';
	uiMode?: 'embedded_page';
	customerId?: string;
	createCustomerIfMissing: boolean;
	currency: string;
	unitAmount: number;
	productId: string;
	recurringIntervalCount?: number;
	returnUrl?: string;
	successUrl?: string;
	metadata?: Record<string, string>;
	subscriptionMetadata?: Record<string, string>;
};

export type StripeCheckoutSessionCreateResult = {
	id: string;
	clientSecret: string | null;
	url: string | null;
};

export type StripeBillingPortalCreateInput = {
	customerId: string;
	returnUrl: string;
	locale: string | null;
	flow: 'payment_method_update';
};

export type StripeSubscriptionUpdateInput = {
	items?: { id: string; price: string }[];
	prorationBehavior?: 'none';
	metadata?: Record<string, string>;
	defaultPaymentMethod?: string;
};

export type StripePriceCreateInput = {
	currency: string;
	productId: string;
	unitAmount: number;
};

export type StripeCancellationFeedback = 'too_expensive' | 'switched_service' | 'missing_features' | 'unused' | 'other';

const BILLING_PORTAL_LOCALES = [
	'auto',
	'bg',
	'cs',
	'da',
	'de',
	'el',
	'en',
	'en-GB',
	'es',
	'es-419',
	'et',
	'fi',
	'fil',
	'fr',
	'fr-CA',
	'hr',
	'hu',
	'id',
	'it',
	'ja',
	'ko',
	'lt',
	'lv',
	'ms',
	'mt',
	'nb',
	'nl',
	'pl',
	'pt',
	'pt-BR',
	'ro',
	'ru',
	'sk',
	'sl',
	'sv',
	'th',
	'tr',
	'vi',
	'zh',
	'zh-HK',
	'zh-TW',
] as const;

type BillingPortalLocale = (typeof BILLING_PORTAL_LOCALES)[number];

let stripeClient: Stripe | undefined;

export const resolveStripeResourceId = (value: string | { id: string } | null | undefined): string | null => {
	if (!value) {
		return null;
	}
	if (typeof value === 'string') {
		return value;
	}

	return value.id;
};

type InvoiceSubscriptionSource = {
	parent?: {
		subscription_details?: {
			subscription?: string | { id: string } | null;
		} | null;
	} | null;
	subscription?: string | { id: string } | null;
};

export const resolveStripeSubscriptionIdFromInvoice = (invoice: InvoiceSubscriptionSource): string | null => {
	const fromParent = invoice.parent?.subscription_details?.subscription;
	if (fromParent) {
		return resolveStripeResourceId(fromParent);
	}

	return resolveStripeResourceId(invoice.subscription);
};

export const shouldSkipStripeSubscriptionStatus = (status: string): boolean =>
	status === 'incomplete' || status === 'incomplete_expired';

export const mapStripeSubscriptionStatus = (status: string): SubscriptionStatus | null => {
	if (shouldSkipStripeSubscriptionStatus(status)) {
		return null;
	}

	if (status === 'canceled') {
		return SubscriptionStatus.ended;
	}

	if (status === 'active' || status === 'trialing' || status === 'past_due' || status === 'unpaid' || status === 'paused') {
		return SubscriptionStatus.active;
	}

	return null;
};

export const mapStripeRecurringInterval = (interval: string, intervalCount: number): DonationInterval | null => {
	if (interval === 'month' && intervalCount === 1) {
		return DonationInterval.monthly;
	}

	return null;
};

export const mapStripePriceAmount = (unitAmount: number | null): number | null => {
	if (unitAmount === null || unitAmount < 0) {
		return null;
	}

	return unitAmount / 100;
};

export type StripeSubscriptionLifecycleSource = {
	status: string;
	canceled_at?: number | null;
};

export type MappedStripeSubscriptionLifecycle = {
	status: SubscriptionStatus;
	canceledAt: Date | null;
};

export const resolveStripeSubscriptionCanceledAt = (subscription: { canceled_at?: number | null }): Date => {
	if (subscription.canceled_at) {
		return new Date(subscription.canceled_at * 1000);
	}

	return new Date();
};

export const mapStripeSubscriptionLifecycle = (
	subscription: StripeSubscriptionLifecycleSource,
): MappedStripeSubscriptionLifecycle | null => {
	const status = mapStripeSubscriptionStatus(subscription.status);
	if (!status) {
		return null;
	}

	return {
		status,
		canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
	};
};

export type StripeSubscriptionPriceSource = {
	items: {
		data: {
			price?: {
				unit_amount?: number | null;
				currency: string;
				recurring?: {
					interval: string;
					interval_count: number;
				} | null;
			} | null;
		}[];
	};
};

export type MappedStripeSubscriptionPriceFields = {
	amount: number;
	currency: Currency;
	interval: DonationInterval;
};

export const mapStripeSubscriptionPriceFields = (
	subscription: StripeSubscriptionPriceSource,
): MappedStripeSubscriptionPriceFields | null => {
	const price = subscription.items.data[0]?.price;
	if (!price?.recurring) {
		return null;
	}

	const interval = mapStripeRecurringInterval(price.recurring.interval, price.recurring.interval_count);
	if (!interval) {
		return null;
	}

	const amount = mapStripePriceAmount(price.unit_amount ?? null);
	if (amount === null) {
		return null;
	}

	const currencyCode = price.currency.toUpperCase();
	if (!isValidCurrency(currencyCode)) {
		return null;
	}

	return {
		amount,
		currency: currencyCode,
		interval,
	};
};

export type MappedStripeSubscriptionFields = MappedStripeSubscriptionLifecycle & MappedStripeSubscriptionPriceFields;

export const mapStripeSubscriptionFields = (
	subscription: StripeSubscriptionLifecycleSource & StripeSubscriptionPriceSource,
): MappedStripeSubscriptionFields | null => {
	const lifecycle = mapStripeSubscriptionLifecycle(subscription);
	if (!lifecycle) {
		return null;
	}

	const priceFields = mapStripeSubscriptionPriceFields(subscription);
	if (!priceFields) {
		return null;
	}

	return {
		...lifecycle,
		...priceFields,
	};
};

export const getStripeBalanceTransaction = (
	value: StripeApiCharge['balance_transaction'],
): { id?: string; amount?: number; fee?: number } | null => {
	if (!value || typeof value === 'string') {
		return null;
	}

	return value;
};

export const constructStripeWebhookEvent = (
	body: string,
	signature: string,
	webhookSecret: string,
): ServiceResult<StripeApiEvent> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(clientResult.data.webhooks.constructEvent(body, signature, webhookSecret));
	} catch (error) {
		if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
			return resultFail('Invalid Stripe signature', 400);
		}

		console.error('Could not construct Stripe webhook event', { error });

		return resultFail('Failed to handle webhook event');
	}
};

export const createStripeCheckoutSession = async (
	input: StripeCheckoutCreateInput,
): Promise<ServiceResult<StripeCheckoutSessionCreateResult>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const session = await clientResult.data.checkout.sessions.create(toCheckoutSessionCreateParams(input));

		return resultOk({
			id: session.id,
			clientSecret: session.client_secret,
			url: session.url,
		});
	} catch (error) {
		console.error('Could not create Stripe checkout session', { error });

		return resultFail('Could not create Stripe checkout session');
	}
};

export const retrieveStripeCheckoutSession = async (sessionId: string): Promise<ServiceResult<StripeApiCheckoutSession>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(await clientResult.data.checkout.sessions.retrieve(sessionId));
	} catch (error) {
		console.error('Could not retrieve Stripe checkout session', { error });

		return resultFail('Could not retrieve Stripe checkout session');
	}
};

export const listStripeCheckoutSessionsByPaymentIntent = async (
	paymentIntentId: string,
): Promise<ServiceResult<StripeApiCheckoutSession[]>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const sessions = await clientResult.data.checkout.sessions.list({ payment_intent: paymentIntentId });

		return resultOk(sessions.data);
	} catch (error) {
		console.error('Could not list Stripe checkout sessions', { error });

		return resultFail('Could not list Stripe checkout sessions');
	}
};

export const createStripeCustomer = async (email: string, name?: string): Promise<ServiceResult<string>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const customer = await clientResult.data.customers.create({
			email,
			name: name ?? undefined,
		});

		return resultOk(customer.id);
	} catch (error) {
		console.error('Could not create Stripe customer', { error });

		return resultFail('Could not create Stripe customer');
	}
};

export const retrieveStripeCustomer = async (customerId: string): Promise<ServiceResult<StripeApiCustomer>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const customer = await clientResult.data.customers.retrieve(customerId);
		if (customer.deleted) {
			return resultFail('Stripe customer is deleted');
		}

		return resultOk(customer);
	} catch (error) {
		console.error('Could not retrieve Stripe customer', { error });

		return resultFail('Could not retrieve Stripe customer');
	}
};

export const retrieveStripeCharge = async (chargeId: string): Promise<ServiceResult<StripeApiCharge>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(
			await clientResult.data.charges.retrieve(chargeId, {
				expand: ['balance_transaction'],
			}),
		);
	} catch (error) {
		console.error('Could not retrieve Stripe charge', { error });

		return resultFail('Could not retrieve Stripe charge');
	}
};

export const retrieveStripeSubscription = async (
	subscriptionId: string,
	expand?: string[],
): Promise<ServiceResult<StripeApiSubscription | null>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(
			await clientResult.data.subscriptions.retrieve(subscriptionId, expand && expand.length > 0 ? { expand } : undefined),
		);
	} catch (error) {
		if (isMissingStripeResource(error)) {
			return resultOk(null);
		}

		console.error('Could not retrieve Stripe subscription', { error });

		return resultFail('Could not retrieve Stripe subscription');
	}
};

export const listStripeSubscriptions = async (input: {
	customerId: string;
	status?: 'all';
	limit?: number;
}): Promise<ServiceResult<StripeApiSubscription[]>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const subscriptions = await clientResult.data.subscriptions.list({
			customer: input.customerId,
			status: input.status,
			limit: input.limit,
		});

		return resultOk(subscriptions.data);
	} catch (error) {
		if (isMissingStripeCustomer(error)) {
			console.warn('Stripe customer not found in current mode; returning empty subscriptions', {
				stripeCustomerId: input.customerId,
			});

			return resultOk([]);
		}

		console.error('Could not list Stripe subscriptions', { error });

		return resultFail('Could not fetch subscriptions');
	}
};

export const updateStripeSubscription = async (
	subscriptionId: string,
	input: StripeSubscriptionUpdateInput,
): Promise<ServiceResult<StripeApiSubscription>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(
			await clientResult.data.subscriptions.update(subscriptionId, {
				...(input.items ? { items: input.items } : {}),
				...(input.prorationBehavior ? { proration_behavior: input.prorationBehavior } : {}),
				...(input.metadata ? { metadata: input.metadata } : {}),
				...(input.defaultPaymentMethod ? { default_payment_method: input.defaultPaymentMethod } : {}),
			}),
		);
	} catch (error) {
		console.error('Could not update Stripe subscription', { error });

		return resultFail('Could not update Stripe subscription');
	}
};

export const cancelStripeSubscription = async (
	subscriptionId: string,
	feedback: StripeCancellationFeedback,
): Promise<ServiceResult<StripeApiSubscription>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(
			await clientResult.data.subscriptions.cancel(subscriptionId, {
				invoice_now: false,
				prorate: false,
				cancellation_details: { feedback },
			}),
		);
	} catch (error) {
		console.error('Could not cancel Stripe subscription', { error });

		return resultFail('Could not cancel subscription');
	}
};

export const createStripePrice = async (input: StripePriceCreateInput): Promise<ServiceResult<StripeApiPrice>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(
			await clientResult.data.prices.create({
				currency: input.currency,
				product: input.productId,
				unit_amount: input.unitAmount,
				recurring: {
					interval: 'month',
					interval_count: 1,
				},
			}),
		);
	} catch (error) {
		console.error('Could not create Stripe price', { error });

		return resultFail('Could not create Stripe price');
	}
};

export const createStripeBillingPortalSession = async (
	input: StripeBillingPortalCreateInput,
): Promise<ServiceResult<string>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const session = await clientResult.data.billingPortal.sessions.create({
			customer: input.customerId,
			return_url: input.returnUrl,
			locale: toBillingPortalLocale(input.locale),
			flow_data: { type: input.flow },
		});
		if (!session.url) {
			return resultFail('No billing portal URL returned');
		}

		return resultOk(session.url);
	} catch (error) {
		console.error('Could not create Stripe billing portal session', { error });

		return resultFail('Could not create billing portal session');
	}
};

export const retrieveStripePaymentMethod = async (
	paymentMethodId: string,
): Promise<ServiceResult<StripeApiPaymentMethod | null>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		return resultOk(await clientResult.data.paymentMethods.retrieve(paymentMethodId));
	} catch (error) {
		if (isMissingStripeResource(error)) {
			return resultOk(null);
		}

		console.error('Could not retrieve Stripe payment method', { error });

		return resultFail('Could not retrieve Stripe payment method');
	}
};

export const retrieveStripeSubscriptionForCharge = async (
	charge: StripeApiCharge,
): Promise<ServiceResult<StripeApiSubscription | null>> => {
	try {
		const legacyInvoiceId = getChargeInvoiceId(charge);
		if (legacyInvoiceId) {
			const invoiceResult = await retrieveStripeInvoice(legacyInvoiceId);
			if (invoiceResult.success) {
				const subscriptionIdFromLegacyInvoice = resolveStripeSubscriptionIdFromInvoice(invoiceResult.data);
				if (subscriptionIdFromLegacyInvoice) {
					return retrieveStripeSubscription(subscriptionIdFromLegacyInvoice, ['items.data.price']);
				}
			}
		}

		const paymentIntentId = resolveStripeResourceId(charge.payment_intent);
		if (!paymentIntentId) {
			return resultOk(null);
		}

		const invoiceResult = await listStripeInvoicePaymentsForPaymentIntent(paymentIntentId);
		if (!invoiceResult.success) {
			return resultOk(null);
		}
		if (!invoiceResult.data) {
			return resultOk(null);
		}

		const subscriptionId = resolveStripeSubscriptionIdFromInvoice(invoiceResult.data);
		if (!subscriptionId) {
			return resultOk(null);
		}

		return retrieveStripeSubscription(subscriptionId, ['items.data.price']);
	} catch (error) {
		console.error('Failed to resolve Stripe subscription for charge', {
			chargeId: charge.id,
			paymentIntentId: resolveStripeResourceId(charge.payment_intent),
			error,
		});

		return resultOk(null);
	}
};

const listStripeInvoicePaymentsForPaymentIntent = async (
	paymentIntentId: string,
): Promise<ServiceResult<StripeApiInvoice | null>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const invoicePayments = await clientResult.data.invoicePayments.list({
			payment: { type: 'payment_intent', payment_intent: paymentIntentId },
			limit: 1,
			expand: ['data.invoice'],
		});
		const invoicePayment = invoicePayments.data[0];
		if (!invoicePayment) {
			return resultOk(null);
		}

		if (typeof invoicePayment.invoice === 'string') {
			return retrieveStripeInvoice(invoicePayment.invoice);
		}

		if (!invoicePayment.invoice || ('deleted' in invoicePayment.invoice && invoicePayment.invoice.deleted)) {
			return resultOk(null);
		}

		return resultOk(invoicePayment.invoice);
	} catch (error) {
		console.error('Could not list Stripe invoice payments', { error });

		return resultFail('Could not list Stripe invoice payments');
	}
};

const retrieveStripeInvoice = async (invoiceId: string): Promise<ServiceResult<StripeApiInvoice>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const invoice = await clientResult.data.invoices.retrieve(invoiceId);
		if ('deleted' in invoice && invoice.deleted) {
			return resultFail('Stripe invoice is deleted');
		}

		return resultOk(invoice);
	} catch (error) {
		console.error('Could not retrieve Stripe invoice', { error });

		return resultFail('Could not retrieve Stripe invoice');
	}
};

export const listOpenStripeInvoices = async (stripeSubscriptionId: string): Promise<ServiceResult<StripeApiInvoice[]>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const invoices = await clientResult.data.invoices.list({
			subscription: stripeSubscriptionId,
			status: 'open',
			limit: 100,
		});

		return resultOk(invoices.data);
	} catch (error) {
		console.warn('Could not list open invoices while canceling subscription', {
			stripeSubscriptionId,
			error,
		});

		return resultFail('Could not list open invoices');
	}
};

export const voidStripeInvoice = async (invoiceId: string): Promise<ServiceResult<void>> => {
	const clientResult = getStripeClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		await clientResult.data.invoices.voidInvoice(invoiceId);

		return resultOk(undefined);
	} catch (error) {
		console.warn('Could not void open invoice while canceling subscription', {
			invoiceId,
			error,
		});

		return resultFail('Could not void invoice');
	}
};

const getStripeClient = (): ServiceResult<Stripe> => {
	if (stripeClient) {
		return resultOk(stripeClient);
	}

	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		return resultFail('Missing STRIPE_SECRET_KEY environment variable');
	}
	if (!stripeSecretKey.startsWith('sk_')) {
		return resultFail('Invalid STRIPE_SECRET_KEY format');
	}

	stripeClient = new Stripe(stripeSecretKey, { typescript: true });

	return resultOk(stripeClient);
};

const toCheckoutSessionCreateParams = (input: StripeCheckoutCreateInput): Stripe.Checkout.SessionCreateParams => {
	const metadata = input.metadata && Object.keys(input.metadata).length > 0 ? input.metadata : undefined;
	const subscriptionMetadata =
		input.subscriptionMetadata && Object.keys(input.subscriptionMetadata).length > 0
			? input.subscriptionMetadata
			: undefined;

	return {
		mode: input.mode,
		...(input.uiMode ? { ui_mode: input.uiMode } : {}),
		customer: input.customerId,
		customer_creation: input.createCustomerIfMissing ? 'always' : undefined,
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: input.currency.toLowerCase(),
					unit_amount: input.unitAmount,
					product: input.productId,
					...(input.recurringIntervalCount
						? { recurring: { interval: 'month', interval_count: input.recurringIntervalCount } }
						: {}),
				},
			},
		],
		...(input.uiMode
			? {
					redirect_on_completion: input.returnUrl ? 'if_required' : 'never',
					...(input.returnUrl ? { return_url: input.returnUrl } : {}),
				}
			: {}),
		...(input.successUrl ? { success_url: input.successUrl } : {}),
		locale: 'auto',
		...(metadata ? { metadata } : {}),
		...(input.mode === 'subscription' && subscriptionMetadata
			? { subscription_data: { metadata: subscriptionMetadata } }
			: {}),
	};
};

const toBillingPortalLocale = (locale: string | null): BillingPortalLocale => {
	if (!locale) {
		return 'auto';
	}

	const match = BILLING_PORTAL_LOCALES.find((candidate) => candidate === locale);

	return match ?? 'auto';
};

const isStripeRequestError = (
	error: unknown,
): error is { type: string; code?: string; param?: string; message?: string } => {
	if (typeof error !== 'object' || error === null) {
		return false;
	}

	if (!('type' in error) || typeof error.type !== 'string') {
		return false;
	}

	return true;
};

const isMissingStripeResource = (error: unknown): boolean =>
	isStripeRequestError(error) && error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing';

const isMissingStripeCustomer = (error: unknown): boolean => {
	if (!isStripeRequestError(error) || error.type !== 'StripeInvalidRequestError' || error.code !== 'resource_missing') {
		return false;
	}

	return error.param === 'customer' || Boolean(error.message?.includes('No such customer'));
};

const getChargeInvoiceId = (charge: StripeApiCharge): string | null | undefined => {
	if (!('invoice' in charge)) {
		return undefined;
	}

	const invoice = charge.invoice;
	if (typeof invoice === 'string' || invoice === null || invoice === undefined) {
		return invoice;
	}
	if (typeof invoice === 'object' && invoice !== null && 'id' in invoice && typeof invoice.id === 'string') {
		return invoice.id;
	}

	return undefined;
};
