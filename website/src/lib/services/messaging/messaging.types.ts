import { MessageChannel, MessageRecipientType } from '@/generated/prisma/enums';

export type SendMessageInput = {
	channel: MessageChannel;
	recipientType: MessageRecipientType;
	recipientIds: string[];
	templateId?: string;
	freeTextBody?: string;
	freeTextSubject?: string;
};

export type ResolvedRecipient = {
	entityId: string;
	addressee: string;
	templateContext: Record<string, string>;
};

export type MessageBatchResult = {
	totalRequested: number;
	sent: number;
	failed: number;
	errors: Array<{ entityId: string; error: string }>;
};
