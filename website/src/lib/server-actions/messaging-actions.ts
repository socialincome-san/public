'use server';

import { MessagingChannel } from '@/generated/prisma/client';
import { getSessionByType } from '@/lib/firebase/current-account';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { messagingTranslateEntityIdsToContactIds, services } from '@/lib/services/services';
import {
	contributorRowToMessagingRow,
	localPartnerRowToMessagingRow,
	recipientRowToMessagingRow,
} from '@/lib/services/twilio/messaging/recipients-mappers';
import type {
	MessagingRecipientType,
	MessagingRecipientsPage,
	MessagingRecipientsQuery,
	SelectionState,
} from '@/lib/services/twilio/messaging/recipients.types';
import { resolveSelectionToIds } from '@/lib/services/twilio/messaging/resolve-selection';
import type {
	ChannelPreviewSummary,
	DispatchSendInput,
	MessagingJobDetailView,
	MessagingJobListRow,
	MessagingJobStatusView,
} from '@/lib/services/twilio/messaging/twilio-messaging.types';

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
		const res = await services.read.contributor.getPaginatedTableView(userId, baseQuery);
		if (!res.success) {
			return resultFail(res.error);
		}

		return resultOk({
			rows: res.data.tableRows.map(contributorRowToMessagingRow),
			totalCount: res.data.totalCount,
			page: query.page,
			pageSize: query.pageSize,
		});
	}

	if (type === 'recipient') {
		const res = await services.read.recipient.getPaginatedTableView(userId, baseQuery);
		if (!res.success) {
			return resultFail(res.error);
		}

		return resultOk({
			rows: res.data.tableRows.map(recipientRowToMessagingRow),
			totalCount: res.data.totalCount,
			page: query.page,
			pageSize: query.pageSize,
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
	});
}

// ── Send ────────────────────

export async function startMessagingSendAction(input: DispatchSendInput): Promise<ServiceResult<{ jobId: string }>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return services.twilioMessagingDispatch.dispatchSend(input, session.data.id);
}

export async function getMessagingJobAction(jobId: string): Promise<ServiceResult<MessagingJobStatusView>> {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return services.twilioMessagingDispatch.getJobStatus(jobId, session.data.id);
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

	const fetcher = async (page: number, pageSize: number, search: string) => {
		const baseQuery = { page, pageSize, search };
		if (type === 'contributor') {
			const r = await services.read.contributor.getPaginatedTableView(session.data.id, baseQuery);
			if (!r.success) {
				throw new Error(r.error);
			}

			return { ids: r.data.tableRows.map((row) => row.id), totalCount: r.data.totalCount };
		}
		if (type === 'recipient') {
			const r = await services.read.recipient.getPaginatedTableView(session.data.id, baseQuery);
			if (!r.success) {
				throw new Error(r.error);
			}

			return { ids: r.data.tableRows.map((row) => row.id), totalCount: r.data.totalCount };
		}
		const r = await services.read.localPartner.getPaginatedTableView(session.data.id, baseQuery);
		if (!r.success) {
			throw new Error(r.error);
		}

		return { ids: r.data.tableRows.map((row) => row.id), totalCount: r.data.totalCount };
	};

	const entityIds = await resolveSelectionToIds(selection, fetcher);
	const contactIds = await messagingTranslateEntityIdsToContactIds(type, entityIds);

	return services.twilioMessagingChannelPreview.previewByContactIds(contactIds, channel, session.data.id);
}
