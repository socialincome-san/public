import {DocumentReference} from 'firebase-admin/firestore';
import {CollectionReference} from 'firebase-admin/lib/firestore';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import {Contribution, ContributionSourceKey, StatusKey} from '../../../shared/types/admin/Contribution';
import {STRIPE_API_READ_KEY, STRIPE_WEBHOOK_SECRET} from '../config';
import {findFirst} from '../useFirestoreAdmin';

/**
 * Stripe webhook to ingest successfully paid charges into firestore.
 * Adds the relevant information to the contributions subcollection of users.
 */
export const stripeChargeSucceededHookFunc = functions.https.onRequest(async (request, response) => {
    const stripe = new Stripe(STRIPE_API_READ_KEY, {apiVersion: '2022-08-01'});
    try {
        const sig = request.headers['stripe-signature']!;
        const event = stripe.webhooks.constructEvent(request.rawBody, sig, STRIPE_WEBHOOK_SECRET);
        switch (event.type) {
            case 'charge.succeeded': {
                await handleChargeEvent(event, stripe)
                break;
            }
            case 'charge.failed': {
                await handleChargeEvent(event, stripe)
                break;
            }
            default: {
                functions.logger.info(`Unhandled event type ${event.type}`);
            }
        }
        response.send();
    } catch (error) {
        functions.logger.error(error);
        response.status(500).send(`Webhook Error: ${(error as Error).message}`);
    }
});

const handleChargeEvent = async (event: Stripe.Event, stripe: Stripe) => {
    const charge = event.data.object as Stripe.Charge;
    const chargeId = charge.id;
    // The webhook charge doesn't contain the BalanceTransaction with the final fees and the Subscription with the schedule.
    // We call the stripe API again to get the expanded charge
    const fullCharge = await stripe.charges.retrieve(chargeId, {
        expand: ['balance_transaction', 'invoice'],
    });
    await storeCharge(fullCharge);
}

/**
 * Converts the stripe charge to a contribution and stores it in the contributions subcollection of the corresponding user.
 */
export const storeCharge = async (charge: Stripe.Charge): Promise<DocumentReference<Contribution> | undefined> => {
    const userRef =
        (await findFirst('users', (col) => col.where('stripe_customer_id', '==', charge.customer))) ??
        (await findFirst('users', (col) => col.where('email', '==', charge.billing_details.email)));

    if (!userRef) {
        functions.logger.error(`User not found for charge: ${charge.id}, stripe user: ${charge.customer}`);
        return Promise.resolve(undefined);
    }
    const contribution = constructContribution(charge);
    const contributionRef = (userRef.ref.collection('contributions') as CollectionReference<Contribution>).doc(charge.id);
    await contributionRef.set(contribution);
    functions.logger.info(`Ingested ${charge.id} into firestore for user ${userRef.id}`);
    return contributionRef;
};

export const constructContribution = (charge: Stripe.Charge): Contribution => {
    const plan = (charge.invoice as Stripe.Invoice)?.lines?.data[0]?.plan;
    const monthlyInterval =
        plan?.interval === 'month' ? plan?.interval_count : plan?.interval === 'year' ? 12 : undefined;

    const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction
    return {
        source: ContributionSourceKey.STRIPE,
        created: new Date(charge.created * 1000),
        amount: charge.amount / 100,
        currency: charge.currency,
        amount_chf: balanceTransaction?.amount ?  balanceTransaction.amount / 100 : 0,
        fees_chf: balanceTransaction?.fee ? balanceTransaction.fee / 100 : 0,
        monthly_interval: monthlyInterval,
        reference_id: charge.id,
        status: constructStatus(charge.status)
    };
};

const constructStatus = (status: Stripe.Charge.Status) => {
    switch (status) {
        case 'succeeded': return StatusKey.SUCCEEDED
        case 'pending': return StatusKey.PENDING
        case 'failed': return StatusKey.FAILED
        default: return undefined
    }
}


/**
 * One off script to import existing stripe payments into firestore.
 * Continuous update is done through the [stripeWebhook].
 */
export const batchImportStripeChargesFunc = functions
    .runWith({
        timeoutSeconds: 540 // max timeout supported by firebase
    })
    .https.onCall(async () => {
        const stripeBatchSize = 100; // max batch size supported by stripe
        try {
            const stripe = new Stripe(STRIPE_API_READ_KEY, {apiVersion: '2022-08-01'});
            functions.logger.info("Querying Stripe API...");
            for await (const charge of stripe.charges.list({
                expand: ["data.balance_transaction", "data.invoice"], limit: stripeBatchSize
            })) {
                await storeCharge(charge)
            }
            functions.logger.info(`Ingestion finished.`);
        } catch (error) {
            functions.logger.error(error);
            throw error;
        }
    })
