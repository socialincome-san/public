import { Currency } from '@/generated/prisma/enums';
import { z } from 'zod';

const storyReferenceSchema = z.union([z.string(), z.object({ uuid: z.string() })]);

const communityPageSchema = z.object({
	communityEnabled: z.boolean().optional(),
	communityContactEmail: z.string().optional(),
	communityContributors: z
		.array(z.object({ label: z.string().default(''), people: z.array(storyReferenceSchema).default([]) }))
		.optional(),
	communityArticles: z.array(storyReferenceSchema).optional(),
});

export const communityPanelInputSchema = z.object({
	page: communityPageSchema,
	language: z.string().trim().min(1),
	currency: z.enum([Currency.CHF, Currency.EUR, Currency.USD]),
});

export type StoryReference = z.infer<typeof storyReferenceSchema>;

export type CommunityPage = z.infer<typeof communityPageSchema>;
