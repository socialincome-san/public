import type { MessagingChannel, MessagingJobStatus } from '@/generated/prisma/client';
import type { MessagingRecipientType } from '../recipients/recipients.types';
import type { SelectionState } from '../recipients/selection.types';
import type { VariableAssignments } from '../twilio-templates/twilio-template.types';

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
