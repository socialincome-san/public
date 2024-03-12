import { MailchimpAPI, MailchimpSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';

type MailchimpSubscriptionRequest = { json(): Promise<MailchimpSubscriptionData> } & Request;

export async function POST(request: MailchimpSubscriptionRequest) {
	const data = await request.json();
	const mailchimpAPI = new MailchimpAPI(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
	try {
		await mailchimpAPI.upsertSubscription(data, process.env.MAILCHIMP_LIST_ID!);
		return new Response(null, { status: 200 });
	} catch (e) {
		console.error(e);
		return new Response(null, { status: 405 });
	}
}
