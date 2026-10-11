import type { MessagingChannel, Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import type { MessagingPlanRow, VariableAssignments } from './messaging.types';

export const findContributorMessagingTargets = async (contributorIds: string[]) =>
	prisma.contributor.findMany({
		where: { id: { in: contributorIds } },
		select: {
			contactId: true,
			contact: {
				select: {
					phone: { select: { number: true, hasWhatsApp: true } },
				},
			},
		},
	});

export const findContactsForMessagingPlan = async (contactIds: string[]) =>
	prisma.contact.findMany({
		where: { id: { in: contactIds } },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			callingName: true,
			email: true,
			gender: true,
			language: true,
			dateOfBirth: true,
			profession: true,
		},
	});

export const createMessagingJobWithLogs = async (input: {
	templateSid: string;
	templateFriendlyName: string;
	channelRequested: MessagingChannel;
	recipientType: string;
	assignments: VariableAssignments;
	totalSelected: number;
	skippedCount: number;
	fallbackCount: number;
	createdById: string;
	startedAt: Date;
	plan: MessagingPlanRow[];
}) =>
	prisma.$transaction(async (transaction) => {
		const job = await transaction.messagingJob.create({
			data: {
				templateSid: input.templateSid,
				templateFriendlyName: input.templateFriendlyName,
				channelRequested: input.channelRequested,
				recipientType: input.recipientType,
				assignments: input.assignments,
				totalSelected: input.totalSelected,
				sentCount: 0,
				failedCount: 0,
				skippedCount: input.skippedCount,
				fallbackCount: input.fallbackCount,
				deliveredCount: 0,
				status: 'running',
				createdById: input.createdById,
				startedAt: input.startedAt,
			},
			select: { id: true },
		});
		await transaction.messageLog.createMany({
			data: input.plan.map((row) => ({
				jobId: job.id,
				contactId: row.contactId,
				phoneNumber: row.phoneNumber,
				channelRequested: input.channelRequested,
				channelUsed: row.channelUsed,
				fellBack: row.fellBack,
				renderedBody: row.renderedBody,
				twilioStatus: row.channelUsed === null ? null : 'queued',
				skippedReason: row.skippedReason,
			})),
		});

		return job;
	});

export const findDispatchLogs = async (jobId: string) =>
	prisma.messageLog.findMany({
		where: { jobId },
		select: { id: true, contactId: true },
	});

export const updateMessageAsSent = async (messageLogId: string, twilioMessageSid: string) =>
	prisma.messageLog.update({
		where: { id: messageLogId },
		data: { twilioMessageSid, twilioStatus: 'queued' },
		select: { id: true },
	});

export const updateMessageAsFailed = async (messageLogId: string, errorMessage: string) =>
	prisma.messageLog.update({
		where: { id: messageLogId },
		data: {
			twilioStatus: 'failed',
			twilioErrorCode: null,
			twilioErrorMessage: errorMessage,
		},
		select: { id: true },
	});

export const updateMessagingJobCounters = async (jobId: string, sentCount: number, failedCount: number) =>
	prisma.messagingJob.update({
		where: { id: jobId },
		data: { sentCount, failedCount },
		select: { id: true },
	});

export const updateMessagingJobCompleted = async (
	jobId: string,
	input: {
		sentCount: number;
		failedCount: number;
		skippedCount: number;
		fallbackCount: number;
		finishedAt: Date;
	},
) =>
	prisma.messagingJob.update({
		where: { id: jobId },
		data: { ...input, status: 'completed' },
		select: { id: true },
	});

export const updateMessagingJobInterrupted = async (jobId: string, finishedAt: Date) =>
	prisma.messagingJob.update({
		where: { id: jobId },
		data: { status: 'interrupted', finishedAt },
		select: { id: true },
	});

export const findMessagingJobStatus = async (jobId: string) =>
	prisma.messagingJob.findUnique({
		where: { id: jobId },
		select: {
			id: true,
			status: true,
			totalSelected: true,
			sentCount: true,
			failedCount: true,
			skippedCount: true,
			fallbackCount: true,
			deliveredCount: true,
			startedAt: true,
			finishedAt: true,
		},
	});

export const groupMessagingJobChannels = async (jobId: string) =>
	prisma.messageLog.groupBy({
		by: ['channelUsed'],
		where: { jobId, channelUsed: { not: null } },
		_count: { _all: true },
	});

export const updateOrphanedMessagingJobs = async (cutoff: Date, finishedAt: Date) =>
	prisma.messagingJob.updateMany({
		where: { status: 'running', updatedAt: { lt: cutoff } },
		data: { status: 'interrupted', finishedAt },
	});

export const findMessagingJobs = async (skip: number, take: number) =>
	prisma.messagingJob.findMany({
		orderBy: { startedAt: 'desc' },
		skip,
		take,
		select: {
			id: true,
			templateFriendlyName: true,
			channelRequested: true,
			sentCount: true,
			totalSelected: true,
			status: true,
			startedAt: true,
			createdBy: {
				select: {
					contact: { select: { firstName: true, lastName: true } },
				},
			},
		},
	});

export const countMessagingJobs = async () => prisma.messagingJob.count();

export const findMessagingJobDetail = async (jobId: string) =>
	prisma.messagingJob.findUnique({
		where: { id: jobId },
		select: {
			id: true,
			templateSid: true,
			templateFriendlyName: true,
			channelRequested: true,
			recipientType: true,
			status: true,
			totalSelected: true,
			sentCount: true,
			failedCount: true,
			skippedCount: true,
			fallbackCount: true,
			deliveredCount: true,
			startedAt: true,
			finishedAt: true,
			createdBy: {
				select: {
					contact: { select: { firstName: true, lastName: true } },
				},
			},
		},
	});

export const findMessagingJobMessages = async (jobId: string, skip: number, take: number) =>
	prisma.messageLog.findMany({
		where: { jobId },
		orderBy: { createdAt: 'asc' },
		skip,
		take,
		select: {
			id: true,
			phoneNumber: true,
			channelUsed: true,
			fellBack: true,
			twilioMessageSid: true,
			twilioStatus: true,
			twilioErrorCode: true,
			twilioErrorMessage: true,
			skippedReason: true,
			createdAt: true,
			contact: { select: { firstName: true, lastName: true } },
		},
	});

export const countMessagingJobMessages = async (jobId: string) => prisma.messageLog.count({ where: { jobId } });

export const findMessageSidsForStatusSync = async (jobId: string, terminalStatuses: string[]) =>
	prisma.messageLog.findMany({
		where: {
			jobId,
			twilioMessageSid: { not: null },
			twilioStatus: { notIn: terminalStatuses },
		},
		select: { twilioMessageSid: true },
	});

export const findMessageLogByTwilioSid = async (twilioMessageSid: string) =>
	prisma.messageLog.findUnique({
		where: { twilioMessageSid },
		select: {
			id: true,
			jobId: true,
			twilioStatus: true,
			twilioErrorCode: true,
			twilioErrorMessage: true,
		},
	});

export const updateDeliveredMessageStatus = async (input: {
	messageLogId: string;
	jobId: string;
	data: Prisma.MessageLogUpdateManyMutationInput;
}) =>
	prisma.$transaction(async (transaction) => {
		const flipped = await transaction.messageLog.updateMany({
			where: {
				id: input.messageLogId,
				twilioStatus: { notIn: ['delivered', 'read'] },
			},
			data: input.data,
		});
		if (flipped.count === 1) {
			await transaction.messagingJob.update({
				where: { id: input.jobId },
				data: { deliveredCount: { increment: 1 } },
				select: { id: true },
			});
		}

		return flipped.count === 1;
	});

export const updateMessageStatusUnlessBlocked = async (
	messageLogId: string,
	blockedStatuses: string[],
	data: Prisma.MessageLogUpdateManyMutationInput,
) =>
	prisma.messageLog.updateMany({
		where: { id: messageLogId, twilioStatus: { notIn: blockedStatuses } },
		data,
	});
