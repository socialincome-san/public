import {
	NEWSLETTER_LIST_ID,
	NEWSLETTER_SUPPRESSION_LIST_ID,
	NewsletterSubscriptionData,
	SendgridSubscriptionClient,
} from '@socialincome/shared/src/sendgrid/SendgridSubscriptionClient';

export type CreateNewsletterSubscription = Omit<NewsletterSubscriptionData, 'status'>;
type CreateNewsletterSubscriptionReqeust = { json(): Promise<CreateNewsletterSubscription> } & Request;

export async function POST(request: CreateNewsletterSubscriptionReqeust) {
	const data = await request.json();
	const sendgrid = new SendgridSubscriptionClient({
		apiKey: process.env.SENDGRID_API_KEY!,
		listId: NEWSLETTER_LIST_ID,
		suppressionListId: NEWSLETTER_SUPPRESSION_LIST_ID,
	});
	try {
		await sendgrid.upsertSubscription({ ...data, status: 'subscribed' });
		return new Response(null, { status: 200 });
	} catch (e: any) {
		console.error(e);
		return new Response(null, { status: 405 });
	}
}
