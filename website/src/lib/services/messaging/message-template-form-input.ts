import { MessageChannel } from '@/generated/prisma/enums';
import z from 'zod';

const nullableTrimmedString = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}
	const trimmedValue = value.trim();

	return trimmedValue === '' ? null : trimmedValue;
}, z.string().nullable());

export const messageTemplateCreateInputSchema = z.object({
	name: z.string().trim().min(1, 'Name is required.'),
	channel: z.nativeEnum(MessageChannel),
	subject: nullableTrimmedString,
	body: z.string().trim().min(1, 'Body is required.'),
	description: nullableTrimmedString,
	isActive: z.boolean().optional().default(true),
});

export const messageTemplateUpdateInputSchema = messageTemplateCreateInputSchema.extend({
	id: z.string().trim().min(1, 'Template id is required.'),
});

export type MessageTemplateCreateInput = z.infer<typeof messageTemplateCreateInputSchema>;
export type MessageTemplateUpdateInput = z.infer<typeof messageTemplateUpdateInputSchema>;
