'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { MessageChannel } from '@/generated/prisma/enums';
import {
	MessageTemplateCreateInput,
	MessageTemplateUpdateInput,
} from '@/lib/services/messaging/message-template-form-input';
import { SendMessageInput, SendToContactsInput } from '@/lib/services/messaging/messaging.types';
import { RecipientTableQuery } from '@/lib/services/recipient/recipient-table.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createMessageTemplateAction = async (input: MessageTemplateCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.messageTemplate.create(input);
	revalidatePath('/portal/management/message-templates');

	return res;
};

export const updateMessageTemplateAction = async (input: MessageTemplateUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.messageTemplate.update(input);
	revalidatePath('/portal/management/message-templates');

	return res;
};

export const getMessageTemplateAction = async (templateId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return await services.read.messageTemplate.getById(templateId);
};

export const getActiveTemplatesByChannelAction = async (channel: MessageChannel) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return await services.read.messageTemplate.getActiveByChannel(channel);
};

export const sendMessagesAction = async (input: SendMessageInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.messaging.sendMessages(sessionResult.data.id, input);
	revalidatePath('/portal/management/messages');

	return res;
};

export const sendToContactsAction = async (input: SendToContactsInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.messaging.sendToContacts(sessionResult.data.id, input);
	revalidatePath('/portal/management/messages');

	return res;
};

export const getFilteredRecipientIdsAction = async (query: RecipientTableQuery) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return await services.read.recipient.getFilteredRecipientIds(sessionResult.data.id, query);
};
