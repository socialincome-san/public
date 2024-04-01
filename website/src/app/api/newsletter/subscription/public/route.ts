import { MailchimpAPI, NewsletterSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';

export type CreateNewsletterSubscription = Omit<NewsletterSubscriptionData, 'status'>;
type CreateNewsletterSubscriptionReqeust = { json(): Promise<CreateNewsletterSubscription> } & Request;

export async function POST(request: CreateNewsletterSubscriptionReqeust) {
	const data = await request.json();
	const mailchimpAPI = new MailchimpAPI(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
	try {
		await mailchimpAPI.createSubscription({ ...data, status: 'subscribed' }, process.env.MAILCHIMP_LIST_ID!);
		return new Response(null, { status: 200 });
	} catch (e: any) {
		console.error(e);
		return new Response(null, { status: 405, statusText: e });
	}
}
