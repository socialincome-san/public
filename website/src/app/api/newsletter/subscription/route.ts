import { authorizeRequest, handleApiError } from '@/app/api/auth';
import { MailchimpAPI } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { SendgridSubscriptionClient } from '@socialincome/shared/src/sendgrid/SendgridSubscriptionClient';
import { NextResponse } from 'next/server';

/**
 * Get Mailchimp subscription
 */
export async function GET(request: Request) {
	try {
		const userDoc = await authorizeRequest(request);
		const sendgridSubscriptionAPI = initializeSendgridSubscriptionClient();
		const subscriber = await sendgridSubscriptionAPI.getSubscriber(userDoc.get('email'));
		console.log(subscriber);
		return NextResponse.json(subscriber);
	} catch (error: any) {
		return handleApiError(error);
	}
}

/**
 * Upsert Mailchimp subscription
 */
type NewsletterSubscriptionUpdateRequest = {
	json(): Promise<{ status: 'subscribed' | 'unsubscribed' }>;
} & Request;
export async function POST(request: NewsletterSubscriptionUpdateRequest) {
	try {
		const userDoc = await authorizeRequest(request);
		const data = await request.json();
		const sendgridSubscriptionAPI = initializeSendgridSubscriptionClient();
		const response = await sendgridSubscriptionAPI.upsertSubscription(
			{
				email: userDoc.get('email'),
				status: data.status,
				firstname: userDoc.get('personal.name'),
				lastname: userDoc.get('personal.lastname'),
				language: userDoc.get('language'),
			}
		);
		return new Response(null, { status: 200, statusText: 'Success' });
	} catch (error: any) {
		return handleApiError(error);
	}
	
}

export function initializeSendgridSubscriptionClient():SendgridSubscriptionClient {
	const apiKey = process.env.SENDGRID_API_KEY!;
	const listId = process.env.SENDGRID_LIST_ID!;
	const suppressionListId = process.env.SENDGRID_SUPPRESSION_LIST_ID!;
	if (!apiKey) {
		throw new Error('Sendgrid API Key is empty.');
	} else if (!listId) {
		throw new Error('Sendgrid list Id is empty.');
	}	else if (!suppressionListId) {
		throw new Error('Sendgrid list Id is empty.');
	} else {
		const sendgridSubscriptionClient = new SendgridSubscriptionClient({
			apiKey: apiKey,
			listId: listId,
			suppressionListId: suppressionListId
		})
		return sendgridSubscriptionClient
	}
}
