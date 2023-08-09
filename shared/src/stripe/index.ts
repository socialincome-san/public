import Stripe from 'stripe';

export const initializeStripe = (apiKey: string) => {
	return new Stripe(apiKey, {
		typescript: true,
		apiVersion: '2022-11-15',
	});
};
