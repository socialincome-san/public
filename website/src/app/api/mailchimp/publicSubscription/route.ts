 import { MailchimpAPI } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
 import { MailchimpSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI' ;
 
 
 type MailchimpSubscriptionRequest = { json(): Promise<MailchimpSubscriptionData> } & Request;
 
 export async function POST(request: MailchimpSubscriptionRequest) {
	 const data: MailchimpSubscriptionData = await request.json();
	 const mailchimpAPI = new MailchimpAPI(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
	 const existingUser = await mailchimpAPI.getSubscriber(data.email, process.env.MAILCHIMP_LIST_ID!);
	 if (existingUser === null) {
		const response = await mailchimpAPI.createSubscription(data, process.env.MAILCHIMP_LIST_ID!);
		return new Response(null, { status: 200, statusText: 'success'});
	 } else {
		return new Response(null, { status: 403, statusText: 'Existing user'});
	 }
 }