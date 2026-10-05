import { z } from 'zod';

const journalLanguageSchema = z.string().trim().min(1);

export const journalPageRequestSchema = z.object({
	lang: journalLanguageSchema,
	region: z.string().trim().min(1),
	slug: z.string().trim().min(1),
	journalLabel: z.string(),
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
