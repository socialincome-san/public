import { collection } from '../src/useFirestoreAdmin';
import { storeCharge } from '../src/etl/stripeWebhook';
import Stripe from 'stripe';

const stripeCharges = await collection<Stripe.Charge>('strip-charges').get();
stripeCharges.docs.forEach((doc) => storeCharge(doc.data));
