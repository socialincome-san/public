'use server';

import { MessagingChannel } from '@/generated/prisma/client';
import { getSessionByType } from '@/lib/firebase/current-account';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import type {
	ChannelPreviewSummary,
	DispatchSendInput,
	MessagingJobStatusView,
} from '@/lib/services/twilio/messaging/dispatch/dispatch.types';
import type { MessagingJobDetailView, MessagingJobListRow } from '@/lib/services/twilio/messaging/logs/log.types';
import {
	contributorRowToMessagingRow,
	localPartnerRowToMessagingRow,
	recipientRowToMessagingRow,
} from '@/lib/services/twilio/messaging/recipients/recipients-mappers';
import {
	RECIPIENT_STATUS_FILTER_OPTIONS,
	type MessagingRecipientType,
	type MessagingRecipientsPage,
	type MessagingRecipientsQuery,
} from '@/lib/services/twilio/messaging/recipients/recipients.types';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';

// ── Log ─────────────────────

export async function listMessagingJobsAction(query: {
	page: number;
	pageSize: number;
}): Promise<ServiceResult<{ rows: MessagingJobListRow[]; totalCount: number }>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return services.messagingLog.listJobs(query, session.data.id);
}

export async function getMessagingJobDetailAction(
	jobId: string,
	query: { page: number; pageSize: number },
): Promise<ServiceResult<MessagingJobDetailView>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return services.messagingLog.getJobWithMessages(jobId, query, session.data.id);
}

export async function syncMessagingJobStatusesAction(
	jobId: string,
): Promise<ServiceResult<{ checked: number; updated: number }>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return services.messagingLog.syncJobStatuses(jobId, session.data.id);
}

// ── Recipients ──────────────

export async function listMessagingRecipientsAction(
	type: MessagingRecipientType,
	query: MessagingRecipientsQuery,
): Promise<ServiceResult<MessagingRecipientsPage>> {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const userId = sessionResult.data.id;
	const baseQuery = { page: query.page, pageSize: query.pageSize, search: query.search };

	if (type === 'contributor') {
		const res = await services.read.contributor.getPaginatedTableView(userId, {
			...baseQuery,
			country: query.filters?.country,
		});
		if (!res.success) {
			return resultFail(res.error);
		}

		return resultOk({
			rows: res.data.tableRows.map(contributorRowToMessagingRow),
			totalCount: res.data.totalCount,
			page: query.page,
			pageSize: query.pageSize,
			filterOptions: { country: res.data.countryFilterOptions },
		});
	}

	if (type === 'recipient') {
		const res = await services.read.recipient.getPaginatedTableView(userId, {
			...baseQuery,
			programId: query.filters?.programId,
			recipientStatus: query.filters?.recipientStatus,
		});
		if (!res.success) {
			return resultFail(res.error);
		}

		return resultOk({
			rows: res.data.tableRows.map(recipientRowToMessagingRow),
			totalCount: res.data.totalCount,
			page: query.page,
			pageSize: query.pageSize,
			filterOptions: {
				program: res.data.programFilterOptions.map((option) => ({ value: option.id, label: option.name })),
				status: RECIPIENT_STATUS_FILTER_OPTIONS,
			},
		});
	}

	const res = await services.read.localPartner.getPaginatedTableView(userId, baseQuery);
	if (!res.success) {
		return resultFail(res.error);
	}

	return resultOk({
		rows: res.data.tableRows.map(localPartnerRowToMessagingRow),
		totalCount: res.data.totalCount,
		page: query.page,
		pageSize: query.pageSize,
		filterOptions: {},
	});
}

// ── Send ────────────────────

export async function startMessagingSendAction(input: DispatchSendInput): Promise<ServiceResult<{ jobId: string }>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return services.messagingDispatch.dispatchSend(input, session.data.id);
}

export async function getMessagingJobAction(jobId: string): Promise<ServiceResult<MessagingJobStatusView>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return services.messagingDispatch.getJobStatus(jobId, session.data.id);
}

export async function previewMessagingChannelAction(
	type: MessagingRecipientType,
	selection: SelectionState,
	channel: MessagingChannel,
): Promise<ServiceResult<ChannelPreviewSummary>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	const contactIds = await services.messagingRecipients.resolveContactIds(type, selection, session.data.id);

	return services.messagingChannelPreview.previewByContactIds(contactIds, channel, session.data.id);
}
