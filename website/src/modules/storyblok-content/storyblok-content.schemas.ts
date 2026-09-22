import { z } from 'zod';

export const storyblokLanguageSchema = z.string().trim().min(1);

export const storyblokSlugInputSchema = z.object({
	slug: z.string().trim().min(1),
	language: storyblokLanguageSchema,
});

export const storyblokStoryInputSchema = z.object({
	storyPath: z.string().trim().min(1),
	language: storyblokLanguageSchema,
});

export const storyblokStringListInputSchema = z.object({
	language: storyblokLanguageSchema,
	values: z.array(z.string()),
});

export const storyblokPreviewUpdateSchema = z.object({
	story: z.object({}).passthrough(),
	previewToken: z.string().min(1),
	previewTimestamp: z.string().min(1),
	previewRoutePath: z.string().startsWith('/'),
});
