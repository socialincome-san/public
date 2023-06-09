import { describe, test } from '@jest/globals';
import * as admin from 'firebase-admin';
import functions from 'firebase-functions-test';
import Stripe from 'stripe';
import { getOrInitializeApp } from '../../../../shared/src/firebase/app';
import { FirestoreAdmin } from '../../../../shared/src/firebase/FirestoreAdmin';
import { Contribution, ContributionSourceKey, StatusKey, User, UserStatusKey } from '../../../../shared/src/types';
import { StripeWebhook } from './StripeWebhook';
import Timestamp = admin.firestore.Timestamp;

describe('stripeWebhook', () => {
	const projectId = 'test-' + new Date().getTime();
	const testEnv = functions({ projectId });
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeApp({ projectId: projectId }));
	const stripeWebhook = new StripeWebhook({ firestoreAdmin });

	beforeEach(async () => {
		await testEnv.firestore.clearFirestoreData({ projectId });
	});

	test('storeCharge for inexisting user', async () => {
		const initialUser = await stripeWebhook.findUser(testCharge);
		expect(initialUser).toBeUndefined();

		const ref = await stripeWebhook.storeCharge(testCharge);
		const contribution = await ref!.get();
		expect(contribution.data()).toEqual(expectedContribution);

		const createdUser = await stripeWebhook.findUser(testCharge);
		expect(createdUser!.data()).toEqual(expectedUser);
	});

	test('storeCharge for existing user through stripe id', async () => {
		await firestoreAdmin.doc<{}>('users', 'test-user').set({
			stripe_customer_id: 'cus_123',
		});

		const ref = await stripeWebhook.storeCharge(testCharge);
		const contribution = await ref!.get();
		expect(contribution.data()).toEqual(expectedContribution);
	});

	test('storeCharge for existing user through email', async () => {
		await firestoreAdmin.doc<{}>('users', 'test-user').set({
			email: 'test@socialincome.org',
		});

		const ref = await stripeWebhook.storeCharge(testCharge);
		const contribution = await ref!.get();
		expect(contribution.data()).toEqual(expectedContribution);
	});

	const testCharge: Stripe.Charge = {
		id: 'ch_123',
		object: 'charge',
		amount: 90000,
		amount_captured: 90000,
		amount_refunded: 0,
		application: null,
		application_fee: null,
		application_fee_amount: null,
		balance_transaction: {
			id: 'txn_123',
			object: 'balance_transaction',
			amount: 81868,
			available_on: 1615334400,
			created: 1614969381,
			currency: 'chf',
			description: 'Subscription update',
			exchange_rate: 0.909643,
			fee: 2404,
			fee_details: [
				{
					amount: 2404,
					application: null,
					currency: 'chf',
					description: 'Stripe processing fees',
					type: 'stripe_fee',
				},
			],
			net: 79464,
			reporting_category: 'charge',
			source: 'ch_123',
			status: 'available',
			type: 'charge',
		},
		billing_details: {
			address: {
				city: null,
				country: 'US',
				line1: null,
				line2: null,
				postal_code: null,
				state: null,
			},
			email: 'test@socialincome.org',
			name: 'test user',
			phone: null,
		},
		calculated_statement_descriptor: 'SOCIAL INCOME',
		captured: true,
		created: 1614969381,
		currency: 'usd',
		customer: 'cus_123',
		description: 'Subscription update',
		destination: null,
		dispute: null,
		disputed: false,
		failure_balance_transaction: null,
		failure_code: null,
		failure_message: null,
		fraud_details: {},
		invoice: {
			id: 'in_123',
			object: 'invoice',
			account_country: 'CH',
			account_name: 'Social Income',
			account_tax_ids: null,
			amount_due: 90000,
			amount_paid: 90000,
			amount_remaining: 0,
			application: null,
			application_fee_amount: null,
			attempt_count: 1,
			attempted: true,
			auto_advance: false,
			automatic_tax: {
				enabled: false,
				status: null,
			},
			billing_reason: 'subscription_create',
			charge: 'ch_123',
			collection_method: 'charge_automatically',
			created: 1614965472,
			currency: 'usd',
			custom_fields: null,
			customer: 'cus_123',
			customer_address: null,
			customer_email: 'test@socialincome.org',
			customer_name: null,
			customer_phone: null,
			customer_shipping: null,
			customer_tax_exempt: 'none',
			customer_tax_ids: [],
			default_payment_method: null,
			default_source: null,
			default_tax_rates: [],
			description: null,
			discount: null,
			discounts: [],
			due_date: null,
			ending_balance: 0,
			footer: null,
			from_invoice: null,
			hosted_invoice_url: '',
			invoice_pdf: '',
			last_finalization_error: null,
			latest_revision: null,
			lines: {
				object: 'list',
				data: [
					{
						id: 'il_123',
						object: 'line_item',
						amount: 90000,
						amount_excluding_tax: 90000,
						currency: 'usd',
						description: '1 × 1%  plan (at $900.00 / every 3 months)',
						discount_amounts: [],
						discountable: true,
						discounts: [],
						livemode: true,
						metadata: {},
						period: {
							end: 1622914272,
							start: 1614965472,
						},
						plan: {
							id: 'plan_123',
							object: 'plan',
							active: true,
							aggregate_usage: null,
							amount: 90000,
							amount_decimal: '90000',
							billing_scheme: 'per_unit',
							created: 1614965417,
							currency: 'usd',
							interval: 'month',
							interval_count: 3,
							livemode: true,
							metadata: {},
							nickname: null,
							product: 'prod_123',
							tiers_mode: null,
							transform_usage: null,
							trial_period_days: null,
							usage_type: 'licensed',
						},
						price: {
							id: 'plan_123',
							object: 'price',
							active: true,
							billing_scheme: 'per_unit',
							created: 1614965417,
							currency: 'usd',
							custom_unit_amount: null,
							livemode: true,
							lookup_key: null,
							metadata: {},
							nickname: null,
							product: 'prod_123',
							recurring: {
								aggregate_usage: null,
								interval: 'month',
								interval_count: 3,
								trial_period_days: null,
								usage_type: 'licensed',
							},
							tax_behavior: 'unspecified',
							tiers_mode: null,
							transform_quantity: null,
							type: 'recurring',
							unit_amount: 90000,
							unit_amount_decimal: '90000',
						},
						proration: false,
						proration_details: {
							credited_items: null,
						},
						quantity: 1,
						subscription: 'sub_123',
						subscription_item: 'si_123',
						tax_amounts: [],
						tax_rates: [],
						type: 'subscription',
						unit_amount_excluding_tax: '90000',
					},
				],
				has_more: false,
				url: '',
			},
			livemode: true,
			metadata: {},
			next_payment_attempt: null,
			number: '123',
			on_behalf_of: null,
			paid: true,
			paid_out_of_band: false,
			payment_intent: 'pi_123',
			payment_settings: {
				default_mandate: null,
				payment_method_options: null,
				payment_method_types: null,
			},
			period_end: 1614965472,
			period_start: 1614965472,
			post_payment_credit_notes_amount: 0,
			pre_payment_credit_notes_amount: 0,
			quote: null,
			receipt_number: '123',
			rendering_options: null,
			starting_balance: 0,
			statement_descriptor: null,
			status: 'paid',
			status_transitions: {
				finalized_at: 1614965473,
				marked_uncollectible_at: null,
				paid_at: 1614969383,
				voided_at: null,
			},
			subscription: 'sub_123',
			subtotal: 90000,
			subtotal_excluding_tax: 90000,
			tax: null,
			test_clock: null,
			total: 90000,
			total_discount_amounts: [],
			total_excluding_tax: null,
			total_tax_amounts: [],
			transfer_data: null,
			webhooks_delivered_at: 1614965477,
		},
		livemode: true,
		metadata: {},
		on_behalf_of: null,
		outcome: {
			network_status: 'approved_by_network',
			reason: null,
			risk_level: 'normal',
			seller_message: 'Payment complete.',
			type: 'authorized',
		},
		paid: true,
		payment_intent: 'pi_123',
		payment_method: 'pm_123',
		payment_method_details: {
			card: {
				brand: 'mastercard',
				checks: {
					address_line1_check: null,
					address_postal_code_check: null,
					cvc_check: 'pass',
				},
				country: 'US',
				exp_month: 5,
				exp_year: 2023,
				fingerprint: '123',
				funding: 'credit',
				installments: null,
				last4: '1234',
				mandate: null,
				network: 'mastercard',
				three_d_secure: null,
				wallet: null,
			},
			type: 'card',
		},
		receipt_email: 'test@socialincome.org',
		receipt_number: '123',
		receipt_url: '',
		refunded: false,
		refunds: {
			object: 'list',
			data: [],
			has_more: false,
			url: '',
		},
		review: null,
		shipping: null,
		source: null,
		source_transfer: null,
		statement_descriptor: null,
		statement_descriptor_suffix: null,
		status: 'succeeded',
		transfer_data: null,
		transfer_group: null,
	};

	const expectedContribution: Contribution = {
		source: ContributionSourceKey.STRIPE,
		created: Timestamp.fromDate(new Date('2021-03-05T18:36:21.000Z')),
		amount: 900,
		currency: 'usd',
		amount_chf: 818.68,
		fees_chf: 24.04,
		monthly_interval: 3,
		reference_id: 'ch_123',
		status: StatusKey.SUCCEEDED,
	};

	const expectedUser: User = {
		personal: {
			name: 'test',
			lastname: 'user',
		},
		email: 'test@socialincome.org',
		stripe_customer_id: 'cus_123',
		test_user: false,
		status: UserStatusKey.INITIALIZED,
		location: 'us',
		currency: 'USD',
	};
});
