import { MailchimpAPI, NewsletterSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { SendgridContactType } from '@socialincome/shared/src/sendgrid/SendgridContactType';
import { initializeSendgridSubscriptionClient } from '../route';

export type CreateNewsletterSubscription = Omit<NewsletterSubscriptionData, 'status'>;
type CreateNewsletterSubscriptionReqeust = { json(): Promise<CreateNewsletterSubscription> } & Request;

export async function POST(request: CreateNewsletterSubscriptionReqeust) {
	const data = await request.json();
	const sendgridSubscriptionAPI = initializeSendgridSubscriptionClient();
	try {
		const response = await sendgridSubscriptionAPI.upsertSubscription({...data, status: 'subscribed'});
		return new Response(null, { status: 200 });		
	} catch (e: any) {
		console.error(e);
		return new Response(null, { status: 405	 });
	}
}
