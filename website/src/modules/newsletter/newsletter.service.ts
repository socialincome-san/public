import {
	searchSendgridNewsletterContact,
	upsertSendgridNewsletterSubscription,
} from '@/integrations/sendgrid/sendgrid-subscription.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import type { SubscribeToNewsletterInput } from './newsletter.schemas';
import type { NewsletterContact, NewsletterSubscriber } from './newsletter.types';
import { toNewsletterLanguage } from './newsletter.types';

export const getActiveNewsletterSubscription = async (
	email: string | null,
): Promise<ServiceResult<NewsletterContact | null>> => {
	if (!email) {
		return resultFail('Email missing in contributor');
	}

	return searchSendgridNewsletterContact(email);
};

export const subscribeToNewsletter = async (input: SubscribeToNewsletterInput): Promise<ServiceResult<void>> => {
	const result = await upsertSendgridNewsletterSubscription({
		...input,
		status: 'subscribed',
	});
	if (!result.success) {
		return resultFail(result.error);
	}

	return resultOk(undefined);
};

export const unsubscribeFromNewsletter = async (subscriber: NewsletterSubscriber): Promise<ServiceResult<void>> => {
	if (!subscriber.email) {
		return resultFail('Email missing contributor');
	}

	const result = await upsertSendgridNewsletterSubscription({
		firstname: subscriber.firstName ?? '',
		lastname: subscriber.lastName ?? '',
		email: subscriber.email,
		language: toNewsletterLanguage(subscriber.language, 'de'),
		country: subscriber.country ?? 'CH',
		status: 'unsubscribed',
	});
	if (!result.success) {
		return resultFail(result.error);
	}

	return resultOk(undefined);
};
