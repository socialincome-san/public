import {
	getTwilioContent,
	getTwilioMessageStatus,
	listTwilioContent,
	sendTwilioContentMessage,
	validateTwilioWebhook,
} from '@/integrations/twilio/twilio-messaging.integration';
import {
	buildTwilioContentVariables,
	parseTwilioTemplateVariables,
	renderTwilioTemplateBody,
} from '@/integrations/twilio/twilio-template.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getPaginatedContributorTableView } from '@/modules/contributors/contributor.service';
import {
	getLocalPartnerMessagingTargets,
	getPaginatedLocalPartnerTableView,
} from '@/modules/local-partners/local-partner.service';
import { getPaginatedRecipientTableView, getRecipientMessagingTargets } from '@/modules/recipients/recipient.service';
import { isAdmin } from '@/modules/users/user.service';
import { canManageMessaging } from './messaging.permissions';
import * as messagingRepository from './messaging.repository';
import type {
	ChannelPreviewInput,
	ChannelPreviewSummary,
	DispatchSendInput,
	MessagingJobDetailView,
	MessagingJobListRow,
	MessagingJobStatusView,
	MessagingPhone,
	MessagingPhoneSource,
	MessagingPlanRow,
	MessagingRecipientFilters,
	MessagingRecipientsPage,
	MessagingRecipientsQuery,
	MessagingRecipientType,
	MessagingTarget,
	RenderableContact,
	SelectionState,
	TwilioStatusCallbackInput,
	TwilioTemplateDetail,
	TwilioTemplateSummary,
} from './messaging.types';

const TEXT_CONTENT_TYPE = 'twilio/text';
const PAYMENT_PHONE_ONLY_FOR_RECIPIENTS = 'Payment phone is only available for recipients';
const DISPATCH_CONCURRENCY = 10;
const COUNTER_FLUSH_EVERY = 50;
const STATUS_SYNC_CONCURRENCY = 10;
const INTERRUPTED_AFTER_MS = 10 * 60 * 1000;
const TERMINAL_STATUSES = ['delivered', 'read', 'failed', 'undelivered'];
const RECIPIENT_STATUS_FILTER_OPTIONS = [
	{ value: 'future', label: 'Future' },
	{ value: 'active', label: 'Active' },
	{ value: 'suspended', label: 'Suspended' },
	{ value: 'completed', label: 'Completed' },
];

export const listTwilioTemplates = async (currentUserId: string): Promise<ServiceResult<TwilioTemplateSummary[]>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}

	const result = await listTwilioContent();
	if (!result.success) {
		return result;
	}

	return resultOk(
		result.data
			.map((template) => ({
				sid: template.sid,
				friendlyName: template.friendlyName,
				language: template.language,
				contentType: template.contentTypes.includes(TEXT_CONTENT_TYPE)
					? TEXT_CONTENT_TYPE
					: (template.contentTypes[0] ?? null),
				whatsappStatus: template.whatsappStatus,
				whatsappCategory: template.whatsappCategory,
			}))
			.filter(({ contentType }) => contentType === TEXT_CONTENT_TYPE),
	);
};

export const getTwilioTemplate = async (
	sid: string,
	currentUserId: string,
): Promise<ServiceResult<TwilioTemplateDetail>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}

	const result = await getTwilioContent(sid);
	if (!result.success) {
		return result;
	}

	const contentTypes = Object.keys(result.data.content);
	const contentType = TEXT_CONTENT_TYPE in result.data.content ? TEXT_CONTENT_TYPE : (contentTypes[0] ?? null);
	const content = contentType ? result.data.content[contentType] : undefined;
	const body = readBody(content);

	return resultOk({
		sid: result.data.sid,
		friendlyName: result.data.friendlyName,
		language: result.data.language,
		contentType,
		body,
		variables: parseTwilioTemplateVariables(body, result.data.variables),
		supportedChannels: result.data.whatsappStatus === 'approved' ? ['sms', 'whatsapp'] : ['sms'],
	});
};

export const listMessagingRecipients = async (
	type: MessagingRecipientType,
	query: MessagingRecipientsQuery,
	currentUserId: string,
): Promise<ServiceResult<MessagingRecipientsPage>> => {
	if (type === 'contributor') {
		const result = await getPaginatedContributorTableView(currentUserId, {
			page: query.page,
			pageSize: query.pageSize,
			search: query.search,
			country: query.filters?.country,
		});
		if (!result.success) {
			return resultFail(result.error);
		}

		return resultOk({
			rows: result.data.tableRows.map((row) => ({
				id: row.id,
				name: `${row.firstName} ${row.lastName}`.trim(),
				subtitle: row.email || null,
			})),
			totalCount: result.data.totalCount,
			page: query.page,
			pageSize: query.pageSize,
			filterOptions: { country: result.data.countryFilterOptions },
		});
	}

	if (type === 'recipient') {
		const result = await getPaginatedRecipientTableView(currentUserId, {
			page: query.page,
			pageSize: query.pageSize,
			search: query.search,
			programId: query.filters?.programId,
			recipientStatus: query.filters?.recipientStatus,
		});
		if (!result.success) {
			return resultFail(result.error);
		}

		return resultOk({
			rows: result.data.tableRows.map((row) => ({
				id: row.id,
				name: `${row.firstName} ${row.lastName}`.trim(),
				subtitle: row.programName ?? row.localPartnerName ?? null,
			})),
			totalCount: result.data.totalCount,
			page: query.page,
			pageSize: query.pageSize,
			filterOptions: {
				program: result.data.programFilterOptions.map((option) => ({ value: option.id, label: option.name })),
				status: RECIPIENT_STATUS_FILTER_OPTIONS,
			},
		});
	}

	const result = await getPaginatedLocalPartnerTableView(currentUserId, {
		page: query.page,
		pageSize: query.pageSize,
		search: query.search,
	});
	if (!result.success) {
		return resultFail(result.error);
	}

	return resultOk({
		rows: result.data.tableRows.map((row) => ({
			id: row.id,
			name: row.name,
			subtitle: row.contactPerson ? row.contactPerson : (row.email ?? null),
		})),
		totalCount: result.data.totalCount,
		page: query.page,
		pageSize: query.pageSize,
		filterOptions: {},
	});
};

export const previewMessagingChannel = async (
	input: ChannelPreviewInput,
	currentUserId: string,
): Promise<ServiceResult<ChannelPreviewSummary>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}
	if (!isPhoneSourceAllowed(input.recipientType, input.phoneSource)) {
		return resultFail(PAYMENT_PHONE_ONLY_FOR_RECIPIENTS);
	}

	const targetsResult = await resolveTargets(
		input.recipientType,
		input.selection,
		input.phoneSource,
		input.phoneFallbackAllowed,
		currentUserId,
	);
	if (!targetsResult.success) {
		return targetsResult;
	}

	let primary = 0;
	let fallback = 0;
	let skippedNoPhone = 0;
	for (const target of targetsResult.data) {
		const resolved = resolveChannel(input.channel, target.phone);
		if (resolved.skippedReason === 'no_phone') {
			skippedNoPhone += 1;
		} else if (resolved.fellBack) {
			fallback += 1;
		} else {
			primary += 1;
		}
	}

	return resultOk({ total: targetsResult.data.length, primary, fallback, skippedNoPhone });
};

export const dispatchMessagingSend = async (
	input: DispatchSendInput,
	currentUserId: string,
): Promise<ServiceResult<{ jobId: string }>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}
	if (!isPhoneSourceAllowed(input.recipientType, input.phoneSource)) {
		return resultFail(PAYMENT_PHONE_ONLY_FOR_RECIPIENTS);
	}

	const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
	if (!messagingServiceSid) {
		return resultFail('Missing TWILIO_MESSAGING_SERVICE_SID');
	}

	const templateResult = await getTwilioTemplate(input.templateSid, currentUserId);
	if (!templateResult.success) {
		return resultFail(templateResult.error);
	}
	const template = templateResult.data;
	const templateBody = template.body;
	if (!templateBody) {
		return resultFail('Template has no body');
	}

	let jobId: string;
	let plan: MessagingPlanRow[];
	let skippedCount: number;
	let fallbackCount: number;
	try {
		const targetsResult = await resolveTargets(
			input.recipientType,
			input.selection,
			input.phoneSource,
			input.phoneFallbackAllowed,
			currentUserId,
		);
		if (!targetsResult.success) {
			return resultFail(targetsResult.error);
		}
		const targets = targetsResult.data;
		const contacts = await messagingRepository.findContactsForMessagingPlan(targets.map(({ contactId }) => contactId));
		const contactById = new Map(contacts.map((contact) => [contact.id, contact]));
		plan = targets.flatMap((target) => {
			const contact = contactById.get(target.contactId);
			if (!contact) {
				return [];
			}
			const resolved = resolveChannel(input.channel, target.phone);
			const renderable: RenderableContact = {
				firstName: contact.firstName,
				lastName: contact.lastName,
				callingName: contact.callingName,
				email: contact.email,
				gender: contact.gender,
				language: contact.language,
				dateOfBirth: contact.dateOfBirth,
				profession: contact.profession,
			};

			return [
				{
					contactId: contact.id,
					phoneNumber: target.phone?.number ?? null,
					channelUsed: resolved.channelUsed,
					fellBack: resolved.fellBack,
					skippedReason: resolved.skippedReason,
					renderedBody: renderTwilioTemplateBody(templateBody, input.assignments, renderable),
					contentVariables: buildTwilioContentVariables(template.variables, input.assignments, renderable),
				},
			];
		});
		skippedCount = plan.filter(({ channelUsed }) => channelUsed === null).length;
		fallbackCount = plan.filter(({ fellBack }) => fellBack).length;
		const job = await messagingRepository.createMessagingJobWithLogs({
			templateSid: input.templateSid,
			templateFriendlyName: template.friendlyName,
			channelRequested: input.channel,
			recipientType: input.recipientType,
			assignments: input.assignments,
			totalSelected: plan.length,
			skippedCount,
			fallbackCount,
			createdById: currentUserId,
			startedAt: new Date(),
			plan,
		});
		jobId = job.id;
	} catch (error) {
		console.error('Failed to prepare messaging job', { error });

		return resultFail('Failed to prepare messaging job');
	}

	try {
		const logs = await messagingRepository.findDispatchLogs(jobId);
		const logByContact = new Map(logs.map((log) => [log.contactId, log]));
		const sendable = plan.filter(
			(row): row is MessagingPlanRow & { channelUsed: 'sms' | 'whatsapp'; phoneNumber: string } =>
				row.channelUsed !== null && row.phoneNumber !== null,
		);
		let sentCount = 0;
		let failedCount = 0;
		let sinceFlush = 0;
		const flushCounters = async (): Promise<void> => {
			sinceFlush = 0;
			try {
				await messagingRepository.updateMessagingJobCounters(jobId, sentCount, failedCount);
			} catch (error) {
				console.error('Failed to flush messaging job counters', { jobId, error });
			}
		};
		const baseUrl = process.env.BASE_URL ?? '';
		const statusCallback = baseUrl.startsWith('https://')
			? `${baseUrl.replace(/\/+$/, '')}/api/v1/twilio/messaging/status`
			: undefined;
		const dispatch = async (row: (typeof sendable)[number]): Promise<void> => {
			const log = logByContact.get(row.contactId);
			if (!log) {
				return;
			}
			const sendResult = await sendTwilioContentMessage({
				messagingServiceSid,
				contentSid: input.templateSid,
				contentVariables: row.contentVariables,
				to: row.channelUsed === 'whatsapp' ? `whatsapp:${row.phoneNumber}` : row.phoneNumber,
				statusCallback,
			});
			if (sendResult.success) {
				sentCount += 1;
				try {
					await messagingRepository.updateMessageAsSent(log.id, sendResult.data.sid);
				} catch (error) {
					console.error('Failed to persist Twilio message SID', { jobId, messageLogId: log.id, error });
				}
			} else {
				failedCount += 1;
				try {
					await messagingRepository.updateMessageAsFailed(log.id, sendResult.error);
				} catch (error) {
					console.error('Failed to persist Twilio message failure', { jobId, messageLogId: log.id, error });
				}
			}
			sinceFlush += 1;
			if (sinceFlush >= COUNTER_FLUSH_EVERY) {
				await flushCounters();
			}
		};

		for (let index = 0; index < sendable.length; index += DISPATCH_CONCURRENCY) {
			const outcomes = await Promise.allSettled(sendable.slice(index, index + DISPATCH_CONCURRENCY).map(dispatch));
			for (const outcome of outcomes) {
				if (outcome.status === 'rejected') {
					console.error('Unexpected messaging dispatch worker failure');
				}
			}
		}

		await messagingRepository.updateMessagingJobCompleted(jobId, {
			sentCount,
			failedCount,
			skippedCount,
			fallbackCount,
			finishedAt: new Date(),
		});

		return resultOk({ jobId });
	} catch (error) {
		console.error('Messaging dispatch failed unexpectedly', { jobId, error });
		try {
			await messagingRepository.updateMessagingJobInterrupted(jobId, new Date());
		} catch (markError) {
			console.error('Failed to mark messaging job interrupted', { jobId, error: markError });
		}

		return resultFail('Dispatch failed unexpectedly');
	}
};

export const getMessagingJobStatus = async (
	jobId: string,
	currentUserId: string,
): Promise<ServiceResult<MessagingJobStatusView>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}

	try {
		const job = await messagingRepository.findMessagingJobStatus(jobId);
		if (!job) {
			return resultFail('Job not found');
		}
		const groups = await messagingRepository.groupMessagingJobChannels(jobId);
		const perChannel = { sms: 0, whatsapp: 0 };
		for (const group of groups) {
			if (group.channelUsed === 'sms') {
				perChannel.sms = group._count._all;
			}
			if (group.channelUsed === 'whatsapp') {
				perChannel.whatsapp = group._count._all;
			}
		}

		return resultOk({ ...job, perChannel });
	} catch (error) {
		console.error('Could not fetch messaging job status', { jobId, error });

		return resultFail('Could not fetch messaging job status');
	}
};

export const listMessagingJobs = async (
	query: { page: number; pageSize: number },
	currentUserId: string,
): Promise<ServiceResult<{ rows: MessagingJobListRow[]; totalCount: number }>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}

	await markOrphanedJobs();
	try {
		const [jobs, totalCount] = await Promise.all([
			messagingRepository.findMessagingJobs((query.page - 1) * query.pageSize, query.pageSize),
			messagingRepository.countMessagingJobs(),
		]);

		return resultOk({
			rows: jobs.map((job) => ({
				id: job.id,
				templateFriendlyName: job.templateFriendlyName,
				channelRequested: job.channelRequested,
				sentCount: job.sentCount,
				totalSelected: job.totalSelected,
				status: job.status,
				startedAt: job.startedAt,
				createdByName: formatCreatedByName(job.createdBy),
			})),
			totalCount,
		});
	} catch (error) {
		console.error('Could not list messaging jobs', { error });

		return resultFail('Could not list messaging jobs');
	}
};

export const getMessagingJobDetail = async (
	jobId: string,
	query: { page: number; pageSize: number },
	currentUserId: string,
): Promise<ServiceResult<MessagingJobDetailView>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}

	try {
		const job = await messagingRepository.findMessagingJobDetail(jobId);
		if (!job) {
			return resultFail('Job not found');
		}
		const [messages, totalCount] = await Promise.all([
			messagingRepository.findMessagingJobMessages(jobId, (query.page - 1) * query.pageSize, query.pageSize),
			messagingRepository.countMessagingJobMessages(jobId),
		]);

		return resultOk({
			job: {
				id: job.id,
				templateSid: job.templateSid,
				templateFriendlyName: job.templateFriendlyName,
				channelRequested: job.channelRequested,
				recipientType: job.recipientType,
				status: job.status,
				totalSelected: job.totalSelected,
				sentCount: job.sentCount,
				failedCount: job.failedCount,
				skippedCount: job.skippedCount,
				fallbackCount: job.fallbackCount,
				deliveredCount: job.deliveredCount,
				startedAt: job.startedAt,
				finishedAt: job.finishedAt,
				createdByName: formatCreatedByName(job.createdBy),
			},
			messages: {
				rows: messages.map((message) => ({
					id: message.id,
					contactName: `${message.contact.firstName} ${message.contact.lastName}`.trim() || 'Unknown',
					phoneNumber: message.phoneNumber,
					channelUsed: message.channelUsed,
					fellBack: message.fellBack,
					twilioMessageSid: message.twilioMessageSid,
					twilioStatus: message.twilioStatus,
					twilioErrorCode: message.twilioErrorCode,
					twilioErrorMessage: message.twilioErrorMessage,
					skippedReason: message.skippedReason,
					createdAt: message.createdAt,
				})),
				totalCount,
				page: query.page,
				pageSize: query.pageSize,
			},
		});
	} catch (error) {
		console.error('Could not fetch messaging job detail', { jobId, error });

		return resultFail('Could not fetch messaging job detail');
	}
};

export const syncMessagingJobStatuses = async (
	jobId: string,
	currentUserId: string,
): Promise<ServiceResult<{ checked: number; updated: number }>> => {
	const permissionResult = await assertMessagingAdmin(currentUserId);
	if (!permissionResult.success) {
		return permissionResult;
	}

	try {
		const rows = await messagingRepository.findMessageSidsForStatusSync(jobId, TERMINAL_STATUSES);
		const sids = rows.flatMap(({ twilioMessageSid }) => (twilioMessageSid ? [twilioMessageSid] : []));
		let updated = 0;
		const syncRow = async (sid: string): Promise<void> => {
			const statusResult = await getTwilioMessageStatus(sid);
			if (!statusResult.success) {
				return;
			}
			const updateResult = await handleMessagingStatusCallback({
				messageSid: sid,
				status: statusResult.data.status,
				errorCode: statusResult.data.errorCode,
				errorMessage: statusResult.data.errorMessage,
			});
			if (updateResult.success && updateResult.data.updated) {
				updated += 1;
			}
		};
		for (let index = 0; index < sids.length; index += STATUS_SYNC_CONCURRENCY) {
			await Promise.all(sids.slice(index, index + STATUS_SYNC_CONCURRENCY).map(syncRow));
		}

		return resultOk({ checked: sids.length, updated });
	} catch (error) {
		console.error('Could not synchronize messaging statuses', { jobId, error });

		return resultFail('Could not synchronize messaging statuses');
	}
};

export const handleMessagingStatusCallback = async (
	input: TwilioStatusCallbackInput,
): Promise<ServiceResult<{ updated: boolean }>> => {
	try {
		const existing = await messagingRepository.findMessageLogByTwilioSid(input.messageSid);
		if (!existing) {
			console.warn('Status callback received for unknown Twilio message', { messageSid: input.messageSid });

			return resultOk({ updated: false });
		}
		const data = {
			twilioStatus: input.status,
			twilioErrorCode: input.errorCode ?? existing.twilioErrorCode,
			twilioErrorMessage: input.errorMessage ?? existing.twilioErrorMessage,
		};
		if (input.status === 'delivered') {
			const updated = await messagingRepository.updateDeliveredMessageStatus({
				messageLogId: existing.id,
				jobId: existing.jobId,
				data,
			});

			return resultOk({ updated });
		}

		const blockedStatuses = input.status === 'read' ? ['read'] : ['delivered', 'read'];
		const result = await messagingRepository.updateMessageStatusUnlessBlocked(existing.id, blockedStatuses, data);

		return resultOk({ updated: result.count === 1 });
	} catch (error) {
		console.error('Could not apply Twilio messaging status callback', { input, error });

		return resultFail('Could not apply messaging status callback');
	}
};

export const handleTwilioStatusWebhook = async (input: {
	signature: string;
	url: string;
	params: Record<string, string>;
}): Promise<ServiceResult<{ updated: boolean }>> => {
	const validationResult = await validateTwilioWebhook(input);
	if (!validationResult.success) {
		return resultFail(validationResult.error, validationResult.status);
	}

	return handleMessagingStatusCallback({
		messageSid: input.params.MessageSid ?? '',
		status: input.params.MessageStatus ?? '',
		errorCode: input.params.ErrorCode ?? null,
		errorMessage: input.params.ErrorMessage ?? null,
	});
};

const assertMessagingAdmin = async (currentUserId: string): Promise<ServiceResult<true>> => {
	const adminResult = await isAdmin(currentUserId);
	if (!adminResult.success || !canManageMessaging(adminResult.data)) {
		return resultFail(adminResult.success ? 'Permission denied' : adminResult.error);
	}

	return resultOk(true);
};

const resolveTargets = async (
	type: MessagingRecipientType,
	selection: SelectionState,
	phoneSource: MessagingPhoneSource,
	phoneFallbackAllowed: boolean,
	currentUserId: string,
): Promise<ServiceResult<MessagingTarget[]>> => {
	const idsResult = await resolveSelectionToIds(selection, type, currentUserId);
	if (!idsResult.success) {
		return idsResult;
	}
	if (idsResult.data.length === 0) {
		return resultOk([]);
	}

	if (type === 'recipient') {
		const rowsResult = await getRecipientMessagingTargets(idsResult.data);
		if (!rowsResult.success) {
			return resultFail(rowsResult.error);
		}

		return resultOk(
			rowsResult.data.map((row) => ({
				contactId: row.contactId,
				phone: pickTargetPhone(phoneSource, phoneFallbackAllowed, row.contact.phone, row.paymentInformation?.phone ?? null),
			})),
		);
	}
	if (type === 'local-partner') {
		const rowsResult = await getLocalPartnerMessagingTargets(idsResult.data);
		if (!rowsResult.success) {
			return resultFail(rowsResult.error);
		}

		return resultOk(rowsResult.data.map((row) => ({ contactId: row.contactId, phone: row.contact.phone })));
	}

	try {
		const rows = await messagingRepository.findContributorMessagingTargets(idsResult.data);

		return resultOk(rows.map((row) => ({ contactId: row.contactId, phone: row.contact.phone })));
	} catch (error) {
		console.error('Could not resolve contributor messaging targets', { error });

		return resultFail('Could not resolve messaging targets');
	}
};

const resolveSelectionToIds = async (
	selection: SelectionState,
	type: MessagingRecipientType,
	currentUserId: string,
): Promise<ServiceResult<string[]>> => {
	if (selection.mode === 'include') {
		return resultOk(Array.from(selection.ids));
	}

	const collected: string[] = [];
	let page = 1;
	let totalCount = Number.POSITIVE_INFINITY;
	const pageSize = 200;
	while (collected.length < totalCount) {
		const pageResult = await fetchSelectionPage(type, currentUserId, page, pageSize, selection.search, selection.filters);
		if (!pageResult.success) {
			return pageResult;
		}
		totalCount = pageResult.data.totalCount;
		for (const id of pageResult.data.ids) {
			if (!selection.excludedIds.has(id)) {
				collected.push(id);
			}
		}
		if (pageResult.data.ids.length < pageSize) {
			break;
		}
		page += 1;
	}

	return resultOk(collected);
};

const fetchSelectionPage = async (
	type: MessagingRecipientType,
	currentUserId: string,
	page: number,
	pageSize: number,
	search: string,
	filters: MessagingRecipientFilters,
): Promise<ServiceResult<{ ids: string[]; totalCount: number }>> => {
	if (type === 'recipient') {
		const result = await getPaginatedRecipientTableView(currentUserId, {
			page,
			pageSize,
			search,
			programId: filters.programId,
			recipientStatus: filters.recipientStatus,
		});

		return result.success
			? resultOk({ ids: result.data.tableRows.map(({ id }) => id), totalCount: result.data.totalCount })
			: resultFail(result.error);
	}
	if (type === 'contributor') {
		const result = await getPaginatedContributorTableView(currentUserId, {
			page,
			pageSize,
			search,
			country: filters.country,
		});

		return result.success
			? resultOk({ ids: result.data.tableRows.map(({ id }) => id), totalCount: result.data.totalCount })
			: resultFail(result.error);
	}
	const result = await getPaginatedLocalPartnerTableView(currentUserId, { page, pageSize, search });

	return result.success
		? resultOk({ ids: result.data.tableRows.map(({ id }) => id), totalCount: result.data.totalCount })
		: resultFail(result.error);
};

const markOrphanedJobs = async (): Promise<void> => {
	try {
		const result = await messagingRepository.updateOrphanedMessagingJobs(
			new Date(Date.now() - INTERRUPTED_AFTER_MS),
			new Date(),
		);
		if (result.count > 0) {
			console.warn('Marked orphaned messaging jobs as interrupted', { count: result.count });
		}
	} catch (error) {
		console.error('Could not mark orphaned messaging jobs', { error });
	}
};

const isPhoneSourceAllowed = (type: MessagingRecipientType, source: MessagingPhoneSource): boolean =>
	source !== 'payment' || type === 'recipient';

const pickTargetPhone = (
	source: MessagingPhoneSource,
	fallback: boolean,
	contactPhone: MessagingPhone | null,
	paymentPhone: MessagingPhone | null,
): MessagingPhone | null => {
	const primary = source === 'payment' ? paymentPhone : contactPhone;
	const alternate = source === 'payment' ? contactPhone : paymentPhone;

	return primary ?? (fallback ? alternate : null);
};

const resolveChannel = (
	requested: 'sms' | 'whatsapp',
	phone: MessagingPhone | null,
): {
	channelUsed: 'sms' | 'whatsapp' | null;
	fellBack: boolean;
	skippedReason: 'no_phone' | 'no_channel_available' | null;
} => {
	if (!phone) {
		return { channelUsed: null, fellBack: false, skippedReason: 'no_phone' };
	}
	if (requested === 'whatsapp' && !phone.hasWhatsApp) {
		return { channelUsed: 'sms', fellBack: true, skippedReason: null };
	}

	return { channelUsed: requested, fellBack: false, skippedReason: null };
};

const readBody = (content: unknown): string | null => {
	if (typeof content !== 'object' || content === null || !('body' in content)) {
		return null;
	}

	return typeof content.body === 'string' ? content.body : null;
};

const formatCreatedByName = (createdBy: { contact: { firstName: string; lastName: string } | null }): string => {
	if (!createdBy.contact) {
		return 'Unknown';
	}
	const name = `${createdBy.contact.firstName} ${createdBy.contact.lastName}`.trim();

	return name || 'Unknown';
};
