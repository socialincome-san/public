import { firestoreAdmin } from '@/firebase-admin';
import { SendgridSubscriptionClientProps } from '@socialincome/shared/src/sendgrid/SendgridSubscriptionClient';
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
	const sendgridInitialisationData: SendgridSubscriptionClientProps = {
		apiKey: process.env.SENDGRID_API_KEY!,
		listId: process.env.SENDGRID_LIST_ID!,
		suppressionListId: parseInt(process.env.SENDGRID_SUPPRESSION_LIST_ID!),
	}

	await stripeEventHandler.updateUser(stripeCheckoutSessionId, user, sendgridInitialisationData);
	return new Response(null, { status: 200 });
}
