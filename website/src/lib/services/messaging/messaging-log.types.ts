import { MessageChannel, MessageRecipientType, MessageStatus } from '@/generated/prisma/enums';

export type MessageTableViewRow = {
	id: string;
	channel: MessageChannel;
	addressee: string;
	recipientType: MessageRecipientType | null;
	status: MessageStatus;
	templateName: string | null;
	sentAt: Date | null;
	createdAt: Date;
};

export type MessageTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type MessagePaginatedTableView = {
	tableRows: MessageTableViewRow[];
	totalCount: number;
};
