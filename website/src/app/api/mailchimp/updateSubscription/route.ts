import { NextResponse } from 'next/server';
import { MailchimpEventHandler } from '@socialincome/shared/src/mailchimp/MailchimpEventHandler';
import { MailchimpSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpEventHandler' ;


type MailchimpSubscriptionRequest = { json(): Promise<MailchimpSubscriptionData> } & Request;

export async function POST(request: MailchimpSubscriptionRequest) {
    const data: MailchimpSubscriptionData = await request.json();
    const mailchimpEventHandler = new MailchimpEventHandler(process.env.MAILCHIMP_API_KEY!, process.env.MAILCHIMP_SERVER!);
    const response = await mailchimpEventHandler.updateUser(data, process.env.MAILCHIMP_LIST_ID!);
    return NextResponse.json(response);
}