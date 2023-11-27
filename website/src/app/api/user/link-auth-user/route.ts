import { firestoreAdmin } from '@/firebase-admin';
import { StripeEventHandler } from '@socialincome/shared/src/stripe/StripeEventHandler';
import { LanguageCode } from '@socialincome/shared/src/types/language';

export type LinkAuthUserData = {
	stripeCheckoutSessionId: string;
	authUserId: string;
	language: LanguageCode;
};

type LinkAuthUserRequest = { json(): Promise<LinkAuthUserData> } & Request;

export async function POST(request: LinkAuthUserRequest) {
	const { authUserId, stripeCheckoutSessionId, language } = await request.json();
	const stripeEventHandler = new StripeEventHandler(process.env.STRIPE_SECRET_KEY!, firestoreAdmin);

	await stripeEventHandler.updateUser(stripeCheckoutSessionId, { auth_user_id: authUserId, language });
	return new Response(null, { status: 200 });
}
