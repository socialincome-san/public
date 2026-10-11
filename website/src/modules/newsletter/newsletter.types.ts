import type { CountryCode } from '@/generated/prisma/enums';

export const NEWSLETTER_LANGUAGES = ['de', 'en', 'fr', 'it'] as const;

export type NewsletterLanguage = (typeof NEWSLETTER_LANGUAGES)[number];

export type NewsletterContact = {
	email: string;
	status: 'subscribed' | 'unsubscribed';
};

export type NewsletterSubscriber = {
	email: string | null;
	firstName?: string | null;
	lastName?: string | null;
	language?: string | null;
	country?: CountryCode | null;
};
