/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import { MessageChannel } from '@/generated/prisma/enums';
import {
	MessageTemplateCreateInput,
	MessageTemplateUpdateInput,
} from '@/lib/services/messaging/message-template-form-input';
import z from 'zod';

const channelOptions = Object.values(MessageChannel).map((c) => ({ id: c, label: c }));

type MessageTemplateFormSchema = {
	label: string;
	fields: {
		name: FormField;
		channel: FormField;
		subject: FormField;
		body: FormField;
		description: FormField;
		isActive: FormField;
	};
};

export const initialFormSchema: MessageTemplateFormSchema = {
	label: 'Message Template',
	fields: {
		name: {
			placeholder: 'Template name',
			label: 'Name',
			zodSchema: z.string().min(1, 'Name is required.'),
		},
		channel: {
			placeholder: 'Select channel',
			label: 'Channel',
			zodSchema: z.nativeEnum(getZodEnum(channelOptions)),
		},
		subject: {
			placeholder: 'Email subject line (email only)',
			label: 'Subject',
			zodSchema: z.string().optional(),
		},
		body: {
			placeholder: 'Message body. Use {{contact.firstName}}, {{contact.lastName}}, etc. for placeholders.',
			label: 'Body',
			zodSchema: z.string().min(1, 'Body is required.'),
		},
		description: {
			placeholder: 'Internal description',
			label: 'Description',
			zodSchema: z.string().optional(),
		},
		isActive: {
			label: 'Active',
			zodSchema: z.boolean().optional(),
			value: true,
		},
	},
};

export const buildCreateMessageTemplateInput = (schema: MessageTemplateFormSchema): MessageTemplateCreateInput => {
	return {
		name: schema.fields.name.value,
		channel: schema.fields.channel.value,
		subject: schema.fields.subject.value ?? null,
		body: schema.fields.body.value,
		description: schema.fields.description.value ?? null,
		isActive: schema.fields.isActive.value ?? true,
	};
};

export const buildUpdateMessageTemplateInput = (
	schema: MessageTemplateFormSchema,
	templateId: string,
): MessageTemplateUpdateInput => {
	return {
		id: templateId,
		name: schema.fields.name.value,
		channel: schema.fields.channel.value,
		subject: schema.fields.subject.value ?? null,
		body: schema.fields.body.value,
		description: schema.fields.description.value ?? null,
		isActive: schema.fields.isActive.value ?? true,
	};
};
