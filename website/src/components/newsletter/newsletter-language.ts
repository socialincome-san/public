import { NEWSLETTER_LANGUAGES, type NewsletterLanguage } from '@/modules/newsletter/newsletter.types';

export const toNewsletterLanguage = (
	language: string | null | undefined,
	fallback: NewsletterLanguage = 'en',
): NewsletterLanguage => NEWSLETTER_LANGUAGES.find((candidate) => candidate === language) ?? fallback;
