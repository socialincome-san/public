'use server';

import {
	NewsletterSubscriptionData,
	SendgridSubscriptionClient,
	SupportedLanguage,
} from '@socialincome/shared/src/sendgrid/SendgridSubscriptionClient';
import { SendgridContactType } from '@socialincome/shared/src/sendgrid/types';
import { CountryCode } from '@socialincome/shared/src/types/country';
import { getOptionalContributor } from '../firebase/current-contributor';

export type CreateNewsletterSubscription = Omit<NewsletterSubscriptionData, 'status'>;

type SendgridClientProps = {
	SENDGRID_API_KEY: string;
	SENDGRID_LIST_ID: string;
	SENDGRID_SUPPRESSION_LIST_ID: number;
};

const validateSendgridEnvVars = (): SendgridClientProps => {
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

export async function getActiveSubscription(): Promise<SendgridContactType | null> {
	try {
		const contributor = await getOptionalContributor();
		if (!contributor) {
			throw new Error('Not logged in');
		}
		if (!contributor.email) {
			throw new Error('Email missing in contributor');
		}
		const env: SendgridClientProps = validateSendgridEnvVars();
		const sendgrid = new SendgridSubscriptionClient({
			apiKey: env.SENDGRID_API_KEY!,
			listId: env.SENDGRID_LIST_ID!,
			suppressionListId: env.SENDGRID_SUPPRESSION_LIST_ID,
		});
		const subscriber = await sendgrid.getContact(contributor.email);
		return subscriber;
	} catch (error: any) {
		throw new Error(error);
	}
}

export async function subscribeToNewsletter(subscription: CreateNewsletterSubscription) {
	const env: SendgridClientProps = validateSendgridEnvVars();
	const sendgrid = new SendgridSubscriptionClient({
		apiKey: env.SENDGRID_API_KEY!,
		listId: env.SENDGRID_LIST_ID!,
		suppressionListId: env.SENDGRID_SUPPRESSION_LIST_ID,
	});

	try {
		await sendgrid.upsertSubscription({ ...subscription, status: 'subscribed' });
		throw new Error('Cannot subscribe to Newsletter');
	} catch (error: any) {
		throw new Error(error);
	}
}

export async function unsubscribeFromNewsletter() {
	try {
		const contributor = await getOptionalContributor();
		if (!contributor) {
			throw new Error('Not logged in');
		}
		if (!contributor.email) {
			throw new Error('Email missing contributor');
		}
		const env: SendgridClientProps = validateSendgridEnvVars();
		const sendgrid = new SendgridSubscriptionClient({
			apiKey: env.SENDGRID_API_KEY!,
			listId: env.SENDGRID_LIST_ID!,
			suppressionListId: env.SENDGRID_SUPPRESSION_LIST_ID,
		});
		await sendgrid.upsertSubscription({
			firstname: contributor.firstName || '',
			lastname: contributor.lastName || '',
			email: contributor.email,
			status: 'unsubscribed',
			language: (contributor.language || 'de') as SupportedLanguage,
			country: (contributor.country || 'CH') as CountryCode,
		});
	} catch (error: any) {
		throw new Error(error);
	}
}
