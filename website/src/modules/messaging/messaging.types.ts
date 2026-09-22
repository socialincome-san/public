import type { MessagingChannel, MessagingJobStatus } from '@/generated/prisma/enums';

export type Assignment = { source: 'field'; path: string } | { source: 'constant'; value: string };
export type VariableAssignments = Record<string, Assignment>;
export type ParsedVariable = { key: string; exampleValue: string | null };

export type TwilioTemplateSummary = {
	sid: string;
	friendlyName: string;
	language: string;
	contentType: string | null;
	whatsappStatus: string | null;
	whatsappCategory: string | null;
};

export type TwilioTemplateDetail = {
	sid: string;
	friendlyName: string;
	language: string;
	contentType: string | null;
	body: string | null;
	variables: ParsedVariable[];
	supportedChannels: MessagingChannel[];
};

export type MessagingRecipientType = 'contributor' | 'recipient' | 'local-partner';
export type MessagingPhoneSource = 'contact' | 'payment';
export type MessagingPhone = { number: string; hasWhatsApp: boolean };
export type MessagingTarget = { contactId: string; phone: MessagingPhone | null };
type MessagingRecipientRow = { id: string; name: string; subtitle: string | null };

export type MessagingRecipientFilters = {
	programId?: string;
	recipientStatus?: string;
	country?: string;
};

export type MessagingRecipientsQuery = {
	page: number;
	pageSize: number;
	search: string;
	filters?: MessagingRecipientFilters;
};

export type MessagingRecipientFilterOption = { value: string; label: string };
export type MessagingRecipientFilterOptions = {
	program?: MessagingRecipientFilterOption[];
	status?: MessagingRecipientFilterOption[];
	country?: MessagingRecipientFilterOption[];
};

export type MessagingRecipientsPage = {
	rows: MessagingRecipientRow[];
	totalCount: number;
	page: number;
	pageSize: number;
	filterOptions: MessagingRecipientFilterOptions;
};

export type SelectionState =
	| { mode: 'include'; ids: Set<string> }
	| { mode: 'all-matching'; search: string; filters: MessagingRecipientFilters; excludedIds: Set<string> };

export type PageCheckboxState = 'all' | 'some' | 'none';

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

export type RenderableContact = {
	firstName: string;
	lastName: string;
	callingName: string | null;
	email: string | null;
	gender: string | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
};

export type MessagingPlanRow = {
	contactId: string;
	phoneNumber: string | null;
	channelUsed: MessagingChannel | null;
	fellBack: boolean;
	skippedReason: 'no_phone' | 'no_channel_available' | null;
	renderedBody: string;
	contentVariables: Record<string, string>;
};

export type TwilioStatusCallbackInput = {
	messageSid: string;
	status: string;
	errorCode?: string | null;
	errorMessage?: string | null;
};
