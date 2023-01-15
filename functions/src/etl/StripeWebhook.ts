import { DocumentReference } from 'firebase-admin/firestore';
import { CollectionReference } from 'firebase-admin/lib/firestore';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import {
	Contribution,
	ContributionSourceKey,
	CONTRIBUTION_FIRESTORE_PATH,
	StatusKey,
} from '../../../shared/src/types/admin/Contribution';
import { splitName, User, UserStatusKey, USER_FIRESTORE_PATH } from '../../../shared/src/types/admin/User';
import { STRIPE_API_READ_KEY, STRIPE_WEBHOOK_SECRET } from '../config';

export class StripeWebhook {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}

	/**
	 * Stripe webhook to ingest charge events into firestore.
	 * Adds the relevant information to the contributions subcollection of users.
	 */
	stripeChargeHookFunction = functions.https.onRequest(async (request, response) => {
		const stripe = new Stripe(STRIPE_API_READ_KEY, { apiVersion: '2022-08-01' });
		try {
			const sig = request.headers['stripe-signature']!;
			const event = stripe.webhooks.constructEvent(request.rawBody, sig, STRIPE_WEBHOOK_SECRET);
			switch (event.type) {
				case 'charge.succeeded': {
					await this.handleChargeEvent(event, stripe);
					break;
				}
				case 'charge.failed': {
					await this.handleChargeEvent(event, stripe);
					break;
				}
				default: {
					functions.logger.info(`Unhandled event type ${event.type}`);
				}
			}
			response.send();
		} catch (error) {
			functions.logger.error(error);
			response.status(500).send(`Webhook Error. Check the logs.`);
		}
	});

	handleChargeEvent = async (event: Stripe.Event, stripe: Stripe) => {
		const charge = event.data.object as Stripe.Charge;
		const chargeId = charge.id;
		// The webhook charge doesn't contain the BalanceTransaction with the final fees and the Subscription with the schedule.
		// We call the stripe API again to get the expanded charge
		const fullCharge = await stripe.charges.retrieve(chargeId, {
			expand: ['balance_transaction', 'invoice'],
		});
		await this.storeCharge(fullCharge);
	};

	/**
	 * Converts the stripe charge to a contribution and stores it in the contributions subcollection of the corresponding user.
	 */
	storeCharge = async (charge: Stripe.Charge): Promise<DocumentReference<Contribution> | undefined> => {
		try {
			const userRef = await this.getOrCreateUser(charge);
			if (!userRef) return Promise.resolve(undefined);
			const contribution = this.constructContribution(charge);
			const contributionRef = (
				userRef.collection(CONTRIBUTION_FIRESTORE_PATH) as CollectionReference<Contribution>
			).doc(charge.id);
			await contributionRef.set(contribution);
			functions.logger.info(`Ingested ${charge.id} into firestore for user ${userRef.id}`);
			return contributionRef;
		} catch (error) {
			functions.logger.error(`Error ingesting: ${charge.id}`, error);
			return Promise.resolve(undefined);
		}
	};

	/**
	 * Try to find an existing user using create a new on.
	 */
	getOrCreateUser = async (charge: Stripe.Charge): Promise<DocumentReference<User> | undefined> => {
		const userRef = await this.findUser(charge);
		if (!userRef) {
			functions.logger.info(`User not found for charge: ${charge.id}, stripe user: ${charge.customer}`);
			const userToCreate = this.constructUser(charge);
			if (userToCreate) {
				const newUserRef = await this.firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add(userToCreate);
				functions.logger.info(
					`New user created for charge: ${charge.id}, stripe user: ${charge.customer}, user id: ${newUserRef.id}`
				);
				return newUserRef;
			} else {
				return Promise.resolve(undefined);
			}
		} else {
			return Promise.resolve(userRef.ref);
		}
	};

	/**
	 * First tries to match using the stripe_customer_id otherwise falls back to email.
	 */

	findUser = async (charge: Stripe.Charge) => {
		return (
			(await this.firestoreAdmin.findFirst<User>('users', (col) =>
				col.where('stripe_customer_id', '==', charge.customer)
			)) ??
			(await this.firestoreAdmin.findFirst<User>('users', (col) =>
				col.where('email', '==', charge.billing_details.email)
			))
		);
	};

	/**
	 * Extracts information out of the stripe charge to build a User.
	 * This is mainly for failed payments where we didn't create a user through the website directly
	 */
	constructUser = (charge: Stripe.Charge): User | undefined => {
		if (charge.billing_details.email && charge.billing_details?.name && charge.customer) {
			const { firstname, lastname } = splitName(charge.billing_details?.name);
			return {
				personal: {
					name: firstname,
					lastname: lastname,
				},
				email: charge.billing_details.email!,
				status: UserStatusKey.INITIALIZED,
				stripe_customer_id: charge.customer as string,
				test_user: false,
				location: charge.billing_details.address?.country?.toUpperCase(),
				currency: charge.currency.toUpperCase(),
			};
		} else {
			functions.logger.warn(
				`User not created for charge: ${charge.id}, stripe user: ${charge.customer}. Missing attributes.`
			);
			return undefined;
		}
	};

	/**
	 * Transforms the stripe charge into our own Contribution representation
	 */
	constructContribution = (charge: Stripe.Charge): Contribution => {
		const plan = (charge.invoice as Stripe.Invoice)?.lines?.data[0]?.plan;
		const monthlyInterval = plan?.interval === 'month' ? plan?.interval_count : plan?.interval === 'year' ? 12 : 0;

		const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;
		return {
			source: ContributionSourceKey.STRIPE,
			created: new Date(charge.created * 1000),
			amount: charge.amount / 100,
			currency: charge.currency,
			amount_chf: balanceTransaction?.amount ? balanceTransaction.amount / 100 : 0,
			fees_chf: balanceTransaction?.fee ? balanceTransaction.fee / 100 : 0,
			monthly_interval: monthlyInterval,
			reference_id: charge.id,
			status: this.constructStatus(charge.status),
		};
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
	 * One off script to import existing stripe payments into firestore.
	 * Continuous update is done through the [stripeWebhook].
	 */
	batchImportStripeCharges = functions
		.runWith({
			timeoutSeconds: 540, // max timeout supported by firebase
		})
		.https.onCall(async (_, { auth }) => {
			await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);
			const stripeBatchSize = 100; // max batch size supported by stripe
			const charges = [];
			try {
				const stripe = new Stripe(STRIPE_API_READ_KEY, { apiVersion: '2022-08-01' });
				functions.logger.info('Querying Stripe API...');
				for await (const charge of stripe.charges.list({
					expand: ['data.balance_transaction', 'data.invoice'],
					limit: stripeBatchSize,
				})) {
					charges.push(charge);
				}
				functions.logger.info(`Querying stripe finished.`);

				await Promise.all(charges.map((charge) => this.storeCharge(charge)));
				functions.logger.info(`Ingestion finished.`);
			} catch (error) {
				functions.logger.error(error);
				throw error;
			}
		});
}
