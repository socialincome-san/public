import { z } from 'zod';

export const messagingRecipientTypeSchema = z.enum(['contributor', 'recipient', 'local-partner']);

export const messagingRecipientsQuerySchema = z.object({
	page: z.number().int().positive(),
	pageSize: z.number().int().positive().max(1000),
	search: z.string(),
	filters: z
		.object({
			programId: z.string().optional(),
			recipientStatus: z.string().optional(),
			country: z.string().optional(),
		})
		.optional(),
});

export const messagingPaginationSchema = z.object({
	page: z.number().int().positive(),
	pageSize: z.number().int().positive().max(1000),
});

export const messagingJobIdSchema = z.string().min(1);

const selectionSchema = z.discriminatedUnion('mode', [
	z.object({ mode: z.literal('include'), ids: z.set(z.string()) }),
	z.object({
		mode: z.literal('all-matching'),
		search: z.string(),
		filters: z.object({
			programId: z.string().optional(),
			recipientStatus: z.string().optional(),
			country: z.string().optional(),
		}),
		excludedIds: z.set(z.string()),
	}),
]);

const dispatchBaseSchema = z.object({
	channel: z.enum(['sms', 'whatsapp']),
	recipientType: messagingRecipientTypeSchema,
	phoneSource: z.enum(['contact', 'payment']),
	phoneFallbackAllowed: z.boolean(),
	selection: selectionSchema,
});

export const dispatchSendSchema = dispatchBaseSchema.extend({
	templateSid: z.string().min(1),
	assignments: z.record(
		z.string(),
		z.discriminatedUnion('source', [
			z.object({ source: z.literal('field'), path: z.string() }),
			z.object({ source: z.literal('constant'), value: z.string() }),
		]),
	),
});

export const channelPreviewSchema = dispatchBaseSchema;
