import Stripe from 'stripe';

export const initializeStripe = (apiKey: string) => {
	return new Stripe(apiKey, { typescript: true });
};
