import { CountryCode } from '@/generated/prisma/enums';
import { z } from 'zod';
import { NEWSLETTER_LANGUAGES, type NewsletterLanguage } from './newsletter.types';

export const subscribeToNewsletterSchema = z.object({
	firstname: z.string().trim().min(1).optional(),
	lastname: z.string().trim().min(1).optional(),
	email: z.string().trim().email(),
	language: z.enum(NEWSLETTER_LANGUAGES),
	country: z.nativeEnum(CountryCode).optional(),
	isContributor: z.boolean().optional(),
});

export type SubscribeToNewsletterInput = z.infer<typeof subscribeToNewsletterSchema>;

export const toNewsletterLanguage = (
	language: string | null | undefined,
	fallback: NewsletterLanguage = 'en',
): NewsletterLanguage => {
	const parsed = z.enum(NEWSLETTER_LANGUAGES).safeParse(language);

	return parsed.success ? parsed.data : fallback;
};
