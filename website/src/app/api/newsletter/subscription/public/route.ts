import {
	NewsletterSubscriptionData,
	SendgridSubscriptionClient,
} from '@socialincome/shared/src/sendgrid/SendgridSubscriptionClient';

export type CreateNewsletterSubscription = Omit<NewsletterSubscriptionData, 'status'>;
type CreateNewsletterSubscriptionRequest = { json(): Promise<CreateNewsletterSubscription> } & Request;

type SendgridClientProps = {
	SENDGRID_API_KEY: string;
	SENDGRID_LIST_ID: string;
	SENDGRID_SUPPRESSION_LIST_ID: number;
};

const validateSendgridClientProps = (): SendgridClientProps => {
	const suppressionListId = parseInt(process.env.SENDGRID_SUPPRESSION_LIST_ID!);
	if (isNaN(suppressionListId)) {
		throw new Error('SENDGRID_SUPPRESSION_LIST_ID must be a valid number');
	}

	const sendgridClientProps: SendgridClientProps = {
		SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
		SENDGRID_LIST_ID: process.env.SENDGRID_LIST_ID!,
		SENDGRID_SUPPRESSION_LIST_ID: suppressionListId,
	};

	Object.entries(sendgridClientProps).forEach(([key, value]) => {
		if (!value) throw new Error(`Missing required environment variable: ${key}`);
	});
	return sendgridClientProps;
};

export async function POST(request: CreateNewsletterSubscriptionRequest) {
	const data = await request.json();
	const sendgridClientProps: SendgridClientProps = validateSendgridClientProps();
	const sendgrid = new SendgridSubscriptionClient({
		apiKey: sendgridClientProps.SENDGRID_API_KEY!,
		listId: sendgridClientProps.SENDGRID_LIST_ID!,
		suppressionListId: sendgridClientProps.SENDGRID_SUPPRESSION_LIST_ID,
	});

	try {
		await sendgrid.upsertSubscription({ ...data, status: 'subscribed' });
		return new Response(null, { status: 200 });
	} catch (e: any) {
		console.error(e);
		return new Response(null, { status: 405 });
	}
}
