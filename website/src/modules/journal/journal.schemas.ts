import { Currency } from '@/generated/prisma/enums';
import { z } from 'zod';

const journalLanguageSchema = z.string().trim().min(1);

export const journalPageRequestSchema = z.object({
	lang: journalLanguageSchema,
	currency: z.enum([Currency.CHF, Currency.EUR, Currency.USD]),
	slug: z.string().trim().min(1),
	parentLabel: z.string(),
	homeLabel: z.string(),
});

export const journalArticleRequestSchema = z.object({
	language: journalLanguageSchema,
	slug: z.string().trim().min(1),
});

export const journalLanguageRequestSchema = journalLanguageSchema;

export const journalArticlesByUuidsRequestSchema = z.object({
	language: journalLanguageSchema,
	articleUuids: z.array(z.string().trim().min(1)),
});

export const journalArticlesByTagRequestSchema = z.object({
	language: journalLanguageSchema,
	tagUuid: z.string().trim().min(1),
});

export const journalArticlesByArticleTypeRequestSchema = z.object({
	language: journalLanguageSchema,
	articleTypeUuid: z.string().trim().min(1),
});
