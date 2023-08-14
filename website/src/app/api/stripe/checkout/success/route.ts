import { firestoreAdmin } from '@/firebase/admin';
import { StripeEventHandler } from '@socialincome/shared/src/stripe/StripeEventHandler';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const stripeCheckoutSessionId = searchParams.get('stripeCheckoutSessionId');
	const userId = searchParams.get('userId');
	if (!stripeCheckoutSessionId || !userId) {
		return new Response(null, { status: 400, statusText: 'Missing stripeCheckoutSessionId or userId' });
	}

	const stripeEventHandler = new StripeEventHandler(process.env.STRIPE_SECRET_KEY!, firestoreAdmin);
	await stripeEventHandler.handleCheckoutSessionCompletedEvent(stripeCheckoutSessionId, userId);
	return new Response(null, { status: 200 });
}
