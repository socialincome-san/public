import { firestoreAdmin } from '@/lib/firebase/firebase-admin';
import { StripeEventHandler } from '@socialincome/shared/src/stripe/StripeEventHandler';
import { User } from '@socialincome/shared/src/types/user';

export type UpdateUserData = {
	stripeCheckoutSessionId: string;
	user: Partial<User>;
};

type UpdateUserRequest = { json(): Promise<UpdateUserData> } & Request;

export async function POST(request: UpdateUserRequest) {
	const { stripeCheckoutSessionId, user } = await request.json();
	if (!stripeCheckoutSessionId || !user) {
		return new Response(null, { status: 400, statusText: 'Missing stripeCheckoutSessionId or user' });
	}
	const stripeEventHandler = new StripeEventHandler(process.env.STRIPE_SECRET_KEY!, firestoreAdmin);

	await stripeEventHandler.updateUser(stripeCheckoutSessionId, user);
	return new Response(null, { status: 200 });
}
