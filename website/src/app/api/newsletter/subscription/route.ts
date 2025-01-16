import { authorizeRequest, handleApiError } from '@/app/api/auth';
import { SendgridSubscriptionClient } from '@socialincome/shared/src/sendgrid/SendgridSubscriptionClient';
import { NextResponse } from 'next/server';

/**
 * Get Newsletter subscription
 */
export async function GET(request: Request) {
	try {
		const userDoc = await authorizeRequest(request);
		const sendgrid = new SendgridSubscriptionClient({
			apiKey: process.env.SENDGRID_API_KEY!,
			listId: process.env.SENDGRID_LIST_ID!,
			suppressionListId: parseInt(process.env.SENDGRID_SUPPRESSION_LIST_ID!),
		});
		const subscriber = await sendgrid.getContact(userDoc.get('email'));
		return NextResponse.json(subscriber);
	} catch (error: any) {
		return handleApiError(error);
	}
}

/**
 * Upsert Newsletter subscription
 */
export type NewsletterSubscriptionUpdateRequest = {
	json(): Promise<{ status: 'subscribed' | 'unsubscribed' }>;
} & Request;

export async function POST(request: NewsletterSubscriptionUpdateRequest) {
	try {
		const userDoc = await authorizeRequest(request);
		const data = await request.json();
		const sendgrid = new SendgridSubscriptionClient({
			apiKey: process.env.SENDGRID_API_KEY!,
			listId: process.env.SENDGRID_LIST_ID!,
			suppressionListId: parseInt(process.env.SENDGRID_SUPPRESSION_LIST_ID!),
		});
		await sendgrid.upsertSubscription({
			firstname: userDoc.get('personal.name'),
			lastname: userDoc.get('personal.lastname'),
			email: userDoc.get('email'),
			status: data.status,
			language: userDoc.get('language'),
			country: userDoc.get('country'),
		});
		return new Response(null, { status: 200, statusText: 'Success' });
	} catch (error: any) {
		return handleApiError(error);
	}
}
