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
