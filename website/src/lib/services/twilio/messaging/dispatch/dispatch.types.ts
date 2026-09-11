import type { MessagingChannel, MessagingJobStatus } from '@/generated/prisma/client';
import type { MessagingPhoneSource, MessagingRecipientType } from '../recipients/recipients.types';
import type { SelectionState } from '../recipients/selection.types';
import type { VariableAssignments } from '../twilio-templates/twilio-template.types';

export type DispatchSendInput = {
	templateSid: string;
	channel: MessagingChannel;
	recipientType: MessagingRecipientType;
	phoneSource: MessagingPhoneSource;
	phoneFallbackAllowed: boolean;
	selection: SelectionState;
	assignments: VariableAssignments;
};

export type ChannelPreviewInput = Omit<DispatchSendInput, 'templateSid' | 'assignments'>;

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
