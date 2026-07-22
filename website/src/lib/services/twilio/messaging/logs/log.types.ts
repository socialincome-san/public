import type { MessagingChannel, MessagingJobStatus } from '@/generated/prisma/client';

export type MessagingJobListRow = {
	id: string;
	templateFriendlyName: string;
	channelRequested: MessagingChannel;
	sentCount: number;
	totalSelected: number;
	status: MessagingJobStatus;
	startedAt: Date;
	createdByName: string;
};

export type MessagingJobMessageRow = {
	id: string;
	contactName: string;
	phoneNumber: string | null;
	channelUsed: MessagingChannel | null;
	fellBack: boolean;
	twilioMessageSid: string | null;
	twilioStatus: string | null;
	twilioErrorCode: string | null;
	twilioErrorMessage: string | null;
	skippedReason: string | null;
	createdAt: Date;
};

export type MessagingJobDetailView = {
	job: {
		id: string;
		templateSid: string;
		templateFriendlyName: string;
		channelRequested: MessagingChannel;
		recipientType: string;
		status: MessagingJobStatus;
		totalSelected: number;
		sentCount: number;
		failedCount: number;
		skippedCount: number;
		fallbackCount: number;
		deliveredCount: number;
		startedAt: Date;
		finishedAt: Date | null;
		createdByName: string;
	};
	messages: {
		rows: MessagingJobMessageRow[];
		totalCount: number;
		page: number;
		pageSize: number;
	};
};
