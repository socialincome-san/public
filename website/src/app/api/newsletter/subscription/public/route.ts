import { NewsletterSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { SendgridSubscriptionClient } from '@socialincome/shared/src/sendgrid/SendgridSubscriptionClient';

export type CreateNewsletterSubscription = Omit<NewsletterSubscriptionData, 'status'>;
type CreateNewsletterSubscriptionReqeust = { json(): Promise<CreateNewsletterSubscription> } & Request;

export async function POST(request: CreateNewsletterSubscriptionReqeust) {
	const data = await request.json();
	const sendgrid = new SendgridSubscriptionClient({
		apiKey: process.env.SENDGRID_API_KEY!,
		listId: process.env.SENDGRID_LIST_ID!,
		suppressionListId: Number(process.env.SENDGRID_SUPPRESSION_LIST_ID!),
	});
	try {
		await sendgrid.upsertSubscription({ ...data, status: 'subscribed' });
		return new Response(null, { status: 200 });
	} catch (e: any) {
		console.error(e);
		return new Response(null, { status: 405 });
	}
}
