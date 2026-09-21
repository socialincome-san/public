import { CountryCode } from '@/generated/prisma/enums';
import { z } from 'zod';
import { NEWSLETTER_LANGUAGES } from './newsletter.types';

export const subscribeToNewsletterSchema = z.object({
	firstname: z.string().trim().min(1).optional(),
	lastname: z.string().trim().min(1).optional(),
	email: z.string().trim().email(),
	language: z.enum(NEWSLETTER_LANGUAGES),
	country: z.nativeEnum(CountryCode).optional(),
	isContributor: z.boolean().optional(),
});

export type SubscribeToNewsletterInput = z.infer<typeof subscribeToNewsletterSchema>;
