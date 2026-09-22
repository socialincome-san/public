'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	channelPreviewSchema,
	dispatchSendSchema,
	messagingJobIdSchema,
	messagingPaginationSchema,
	messagingRecipientTypeSchema,
	messagingRecipientsQuerySchema,
} from './messaging.schemas';
import {
	dispatchMessagingSend,
	getMessagingJobDetail,
	getMessagingJobStatus,
	listMessagingJobs,
	listMessagingRecipients,
	previewMessagingChannel,
	syncMessagingJobStatuses,
} from './messaging.service';

export const listMessagingJobsAction = async (query: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const queryResult = messagingPaginationSchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail(queryResult.error.issues[0]?.message ?? 'Invalid pagination');
	}

	return listMessagingJobs(queryResult.data, sessionResult.data.id);
};

export const getMessagingJobDetailAction = async (jobId: unknown, query: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const jobIdResult = messagingJobIdSchema.safeParse(jobId);
	const queryResult = messagingPaginationSchema.safeParse(query);
	if (!jobIdResult.success || !queryResult.success) {
		return resultFail('Invalid messaging job request');
	}

	return getMessagingJobDetail(jobIdResult.data, queryResult.data, sessionResult.data.id);
};

export const syncMessagingJobStatusesAction = async (jobId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const jobIdResult = messagingJobIdSchema.safeParse(jobId);
	if (!jobIdResult.success) {
		return resultFail('Invalid messaging job id');
	}

	const result = await syncMessagingJobStatuses(jobIdResult.data, sessionResult.data.id);
	revalidatePath(`/portal/messaging/delivery-log/${jobIdResult.data}`);

	return result;
};

export const listMessagingRecipientsAction = async (type: unknown, query: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const typeResult = messagingRecipientTypeSchema.safeParse(type);
	const queryResult = messagingRecipientsQuerySchema.safeParse(query);
	if (!typeResult.success || !queryResult.success) {
		return resultFail('Invalid messaging recipients request');
	}

	return listMessagingRecipients(typeResult.data, queryResult.data, sessionResult.data.id);
};

export const startMessagingSendAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = dispatchSendSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid messaging send request');
	}

	const result = await dispatchMessagingSend(inputResult.data, sessionResult.data.id);
	revalidatePath('/portal/messaging/delivery-log');

	return result;
};

export const getMessagingJobAction = async (jobId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const jobIdResult = messagingJobIdSchema.safeParse(jobId);
	if (!jobIdResult.success) {
		return resultFail('Invalid messaging job id');
	}

	return getMessagingJobStatus(jobIdResult.data, sessionResult.data.id);
};

export const previewMessagingChannelAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = channelPreviewSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid messaging preview request');
	}

	return previewMessagingChannel(inputResult.data, sessionResult.data.id);
};
