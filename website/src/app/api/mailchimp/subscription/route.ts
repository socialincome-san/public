import { getUserDocFromAuthToken } from '@/firebase-admin';

import { Body } from '@mailchimp/mailchimp_marketing';
import { MailchimpAPI } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { NextResponse } from 'next/server';

/**
 * Get Mailchimp subscription
 */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const firebaseAuthToken = searchParams.get('firebaseAuthToken');
	if (!firebaseAuthToken) return new Response(null, { status: 403, statusText: 'Missing firebaseAuthToken' });

	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	if (!userDoc) return new Response(null, { status: 400, statusText: 'No user found' });

	const mailchimpAPI = new MailchimpAPI(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
	const subscriber = await mailchimpAPI.getSubscriber(userDoc.get('email'), process.env.MAILCHIMP_LIST_ID!);

	return NextResponse.json(subscriber ? { status: subscriber.status } : { status: 'unknown' });
}

/**
 * Upsert Mailchimp subscription
 */
export type MailchimpSubscriptionUpdate = { status: 'subscribed' | 'unsubscribed'; firebaseAuthToken: string } & Body;
type MailchimpSubscriptionUpdateRequest = { json(): Promise<MailchimpSubscriptionUpdate> } & Request;
export async function POST(request: MailchimpSubscriptionUpdateRequest) {
	const data = await request.json();

	const userDoc = await getUserDocFromAuthToken(data.firebaseAuthToken);
	if (!userDoc) return new Response(null, { status: 400, statusText: 'No user found' });

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
}
