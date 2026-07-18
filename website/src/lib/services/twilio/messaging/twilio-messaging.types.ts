import type { MessagingChannel, MessagingJobStatus } from '@/generated/prisma/client';
import type { MessagingRecipientType, SelectionState } from './recipients.types';

export type Assignment = { source: 'field'; path: string } | { source: 'constant'; value: string };

export type VariableAssignments = Record<string, Assignment>;

export type ContentTemplateSummary = {
	sid: string;
	friendlyName: string;
	language: string;
	contentType: string | null;
	whatsappStatus: string | null;
	whatsappCategory: string | null;
};

export type ParsedVariable = {
	key: string;
	exampleValue: string | null;
};

export type ContentTemplateDetail = {
	sid: string;
	friendlyName: string;
	language: string;
	contentType: string | null;
	body: string | null;
	variables: ParsedVariable[];
};

export type DispatchSendInput = {
	templateSid: string;
	channel: MessagingChannel;
	recipientType: MessagingRecipientType;
	selection: SelectionState;
	assignments: VariableAssignments;
};

export type MessagingJobStatusView = {
	id: string;
	status: MessagingJobStatus;
	totalSelected: number;
	sentCount: number;
	failedCount: number;
	skippedCount: number;
	fallbackCount: number;
	deliveredCount: number;
	startedAt: Date;
	finishedAt: Date | null;
	perChannel: { sms: number; whatsapp: number };
};

export type ChannelPreviewSummary = {
	total: number;
	primary: number;
	fallback: number;
	skippedNoPhone: number;
};

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
