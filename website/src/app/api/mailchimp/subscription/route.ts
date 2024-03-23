import { authorizeRequest, handleApiError } from '@/app/api/auth';
import { Body } from '@mailchimp/mailchimp_marketing';
import { MailchimpAPI } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { NextResponse } from 'next/server';

/**
 * Get Mailchimp subscription
 */
export async function GET(request: Request) {
	try {
		const userDoc = await authorizeRequest(request);
		const mailchimpAPI = new MailchimpAPI(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
		const subscriber = await mailchimpAPI.getSubscriber(userDoc.get('email'), process.env.MAILCHIMP_LIST_ID!);
		return NextResponse.json(subscriber ? { status: subscriber.status } : { status: 'unknown' });
	} catch (error: any) {
		return handleApiError(error);
	}
}

/**
 * Upsert Mailchimp subscription
 */
export type MailchimpSubscriptionUpdate = { status: 'subscribed' | 'unsubscribed' } & Body;
type MailchimpSubscriptionUpdateRequest = { json(): Promise<MailchimpSubscriptionUpdate> } & Request;
export async function POST(request: MailchimpSubscriptionUpdateRequest) {
	try {
		const userDoc = await authorizeRequest(request);
		const data = await request.json();
		const mailchimpAPI = new MailchimpAPI(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
		await mailchimpAPI.upsertSubscription(
			{
				email: userDoc.get('email'),
				status: data.status,
				firstname: userDoc.get('personal.name'),
				lastname: userDoc.get('personal.lastname'),
				language: userDoc.get('language'),
			},
			process.env.MAILCHIMP_LIST_ID!,
		);
		return new Response(null, { status: 200, statusText: 'Success' });
	} catch (error: any) {
		return handleApiError(error);
	}
}
