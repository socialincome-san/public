import { NextResponse } from 'next/server';
import { MailchimpEventHandler } from '@socialincome/shared/src/mailchimp/MailchimpEventHandler';

export type MailchimpData = {
	email: string;
	subscriptionStatus: string;
};


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
	const email: string = searchParams.get('email') ?? "";
    const mailchimpEventHandler = new MailchimpEventHandler(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
    const mailchimpData: MailchimpData = {
        email: email,
        subscriptionStatus: await mailchimpEventHandler.checkSubscription(email, process.env.MAILCHIMP_LIST_ID!)
    };
    return NextResponse.json(mailchimpData);
}