import { CollectionReference, DocumentReference } from 'firebase-admin/firestore';
import { DateTime } from 'luxon';
import Stripe from 'stripe';
import { FirestoreAdmin } from '../firebase/admin/FirestoreAdmin';
import { toFirebaseAdminTimestamp } from '../firebase/admin/utils';
import {
	CONTRIBUTION_FIRESTORE_PATH,
	ContributionSourceKey,
	StatusKey,
	StripeContribution,
} from '../types/contribution';
import { CountryCode } from '../types/country';
import { bestGuessCurrency, Currency } from '../types/currency';
import { splitName, User, USER_FIRESTORE_PATH } from '../types/user';

export class StripeEventHandler {
	readonly stripe: Stripe;
	private readonly firestoreAdmin: FirestoreAdmin;

	constructor(apiKey: string, firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
		this.stripe = new Stripe(apiKey, { typescript: true });
	}

	handleChargeEvent = async (charge: Stripe.Charge) => {
		const chargeId = charge.id;
		// The webhook charge doesn't contain the BalanceTransaction with the final fees and the Subscription with the schedule.
		// We call the stripe API again to get the expanded charge
		const fullCharge = await this.stripe.charges.retrieve(chargeId, {
			expand: ['balance_transaction', 'invoice'],
		});

		const checkoutMetadata = await this.getCheckoutMetadata(charge);

		const firestoreUser = await this.findFirestoreUser(
			await this.retrieveStripeCustomer(fullCharge.customer as string),
		);
		if (fullCharge.status === 'succeeded' || firestoreUser) {
			// We only store non-successful charges if the user already exists.
			// This prevents us from having users in the database that never made a successful contribution.
			return await this.storeCharge(fullCharge, checkoutMetadata);
		}
		return null;
	};

	updateUser = async (checkoutSessionId: string, userData: Partial<User>) => {
		const checkoutSession = await this.stripe.checkout.sessions.retrieve(checkoutSessionId);
		const customer = await this.stripe.customers.retrieve(checkoutSession.customer as string);
		if (customer.deleted) throw Error(`Dealing with a deleted Stripe customer (id=${customer.id})`);
		const userRef = await this.getOrCreateFirestoreUser(customer);
		const user = await userRef.get();
		await this.firestoreAdmin.doc<User>(USER_FIRESTORE_PATH, user.id).update(userData);
	};

	/**
	 * Creates a Stripe.Event object from the request body and signature.
	 */
	constructWebhookEvent = (body: Buffer, signature: string | string[], webhookSecret: string) => {
		return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
	};

	/**
	 * Try to find an existing user using create a new one.
	 */
	getOrCreateFirestoreUser = async (customer: Stripe.Customer): Promise<DocumentReference<User>> => {
		const userDoc = await this.findFirestoreUser(customer);
		if (!userDoc) {
			console.info(`User not found for stripe customer: ${customer.id}`);
			const userToCreate = this.constructUser(customer);
			const newUserRef = await this.firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add(userToCreate);
			console.info(`New user created for Stripe user: ${customer.id}, user id: ${newUserRef.id}`);
			return newUserRef;
		} else {
			await userDoc.ref.update({ stripe_customer_id: customer.id });
			return userDoc.ref;
		}
	};

	/**
	 * First, tries to match using the stripe_customer_id otherwise falls back to email.
	 */
	findFirestoreUser = async (customer: Stripe.Customer) => {
		return (
			(await this.firestoreAdmin.findFirst<User>('users', (col) =>
				col.where('stripe_customer_id', '==', customer.id),
			)) ?? (await this.firestoreAdmin.findFirst<User>('users', (col) => col.where('email', '==', customer.email)))
		);
	};

	retrieveStripeCustomer = async (customerId: string) => {
		const customer = await this.stripe.customers.retrieve(customerId);
		if (customer.deleted) throw Error(`Dealing with a deleted Stripe customer (id=${customer.id})`);
		return customer;
	};

	/**
	 * Transforms the stripe charge into our own Contribution representation
	 */
	constructContribution = (charge: Stripe.Charge, checkoutMetadata: Stripe.Metadata | null): StripeContribution => {
		const plan = (charge.invoice as Stripe.Invoice)?.lines?.data[0]?.plan;
		const monthlyInterval = plan?.interval === 'month' ? plan?.interval_count : plan?.interval === 'year' ? 12 : 0;
		const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;
		const contribution = {
			source: ContributionSourceKey.STRIPE,
			created: toFirebaseAdminTimestamp(DateTime.fromSeconds(charge.created)),
			amount: charge.amount / 100,
			currency: charge.currency.toUpperCase() as Currency,
			amount_chf: balanceTransaction?.amount ? balanceTransaction.amount / 100 : 0,
			fees_chf: balanceTransaction?.fee ? balanceTransaction.fee / 100 : 0,
			monthly_interval: monthlyInterval,
			reference_id: charge.id,
			status: this.constructStatus(charge.status),
		} as StripeContribution;

		return contribution;
	};

	getCheckoutMetadata = async (charge: Stripe.Charge): Promise<Stripe.Metadata | null> => {
		const paymentIntentId = charge.payment_intent;
		if (!paymentIntentId) return null;

		const sessions = await this.stripe.checkout.sessions.list({
			payment_intent: paymentIntentId.toString(),
		});

		const session = sessions.data.length > 0 ? sessions.data[0] : null;
		if (session) {
			return session.metadata;
		} else {
			return null;
		}
	};

	constructStatus = (status: Stripe.Charge.Status) => {
		switch (status) {
			case 'succeeded':
				return StatusKey.SUCCEEDED;
			case 'pending':
				return StatusKey.PENDING;
			case 'failed':
				return StatusKey.FAILED;
			default:
				return StatusKey.UNKNOWN;
		}
	};

	/**
	 * Extracts information out of the stripe charge to build a User.
	 */
	constructUser = (customer: Stripe.Customer): User => {
		if (!customer.id || !customer.email) {
			throw new Error(`Could not create user for Stripe customer: ${customer.id}, unknown id, email`);
		}
		const { firstname, lastname } = splitName(customer.name);
		return {
			personal: { name: firstname, lastname: lastname },
			address: { country: customer.address?.country as CountryCode },
			email: customer.email,
			stripe_customer_id: customer.id,
			payment_reference_id: DateTime.now().toMillis(),
			currency: bestGuessCurrency(customer.address?.country as CountryCode),
			test_user: false,
			created_at: toFirebaseAdminTimestamp(DateTime.now()),
		};
	};

	/**
	 * Converts the stripe charge to a contribution and stores it in the 'contributions' subcollection of the corresponding user.
	 */
	storeCharge = async (
		charge: Stripe.Charge,
		checkoutMetadata: Stripe.Metadata | null,
	): Promise<DocumentReference<StripeContribution>> => {
		const customer = await this.retrieveStripeCustomer(charge.customer as string);
		const userRef = await this.getOrCreateFirestoreUser(customer);
		const contribution = this.constructContribution(charge, checkoutMetadata);
		const contributionRef = (
			userRef.collection(CONTRIBUTION_FIRESTORE_PATH) as CollectionReference<StripeContribution>
		).doc(charge.id);
		await contributionRef.set(contribution, { merge: true });
		console.info(`Updated contribution document: ${contributionRef.path}`);
		return contributionRef;
	};
}
