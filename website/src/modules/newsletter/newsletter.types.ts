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

const isNewsletterLanguage = (value: string | null | undefined): value is NewsletterLanguage =>
	value === 'de' || value === 'en' || value === 'fr' || value === 'it';

export const toNewsletterLanguage = (
	language: string | null | undefined,
	fallback: NewsletterLanguage = 'en',
): NewsletterLanguage => (isNewsletterLanguage(language) ? language : fallback);
