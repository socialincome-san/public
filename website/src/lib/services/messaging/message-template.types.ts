import { MessageChannel } from '@/generated/prisma/enums';

export type MessageTemplateTableViewRow = {
	id: string;
	name: string;
	channel: MessageChannel;
	description: string | null;
	isActive: boolean;
	createdAt: Date;
};

export type MessageTemplateTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type MessageTemplatePaginatedTableView = {
	tableRows: MessageTemplateTableViewRow[];
	totalCount: number;
};

export type MessageTemplatePayload = {
	id: string;
	name: string;
	channel: MessageChannel;
	subject: string | null;
	body: string;
	description: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

export type MessageTemplateOption = {
	id: string;
	name: string;
	body: string;
	subject: string | null;
};
