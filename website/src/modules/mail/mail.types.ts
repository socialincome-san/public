type SendMailTemplate = {
	id: string;
	data: Record<string, unknown>;
};

export type SendMailInput = {
	to: string | string[];
	subject: string;
	// Stored in sent-mail history; template data is rendered by SendGrid when a template is given.
	text: string;
	template?: SendMailTemplate;
	sensitive?: boolean;
};

export type SentEmailTableViewRow = {
	id: string;
	sentAt: Date;
	toEmail: string;
	subject: string;
	body: string;
	fromEmail: string;
	contact: string;
};

export type SentEmailTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type SentEmailPaginatedTableView = {
	tableRows: SentEmailTableViewRow[];
	totalCount: number;
};
