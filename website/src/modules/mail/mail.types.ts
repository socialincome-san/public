import type { SentEmailStatus } from '@/generated/prisma/enums';

type NotificationDefinition = {
	audience: 'contributor' | 'staff' | 'recipient' | 'partner';
	category: 'auth' | 'transactional' | 'marketing' | 'internal';
	recipientsEnv: string;
};

// Every email the platform sends is registered here. Staff receivers come
// from the named comma-separated environment variable.
export const notificationTypes = {
	'monthly-summary': { audience: 'staff', category: 'internal', recipientsEnv: 'MONTHLY_SUMMARY_RECIPIENTS' },
	'campaign-created': {
		audience: 'staff',
		category: 'internal',
		recipientsEnv: 'CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS',
	},
	'campaign-edited': {
		audience: 'staff',
		category: 'internal',
		recipientsEnv: 'CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS',
	},
} as const satisfies Record<string, NotificationDefinition>;

type NotificationType = keyof typeof notificationTypes;

// SendGrid events arrive out of order; a status only replaces one with a lower rank.
export const sentEmailStatusRank = {
	queued: 0,
	failed: 0,
	sent: 1,
	deferred: 2,
	delivered: 3,
	opened: 4,
	bounced: 5,
	dropped: 5,
	spam_reported: 5,
} as const satisfies Record<SentEmailStatus, number>;

type SendNotificationTemplate = {
	id: string;
	data: Record<string, unknown>;
};

export type SendNotificationInput = {
	type: NotificationType;
	subject: string;
	// Stored as the sent email body; SendGrid renders the template instead when one is given.
	text: string;
	template?: SendNotificationTemplate;
	// Scoped per receiver, so a retry only sends to those who did not get it yet.
	idempotencyKey?: string;
	campaignId?: string;
};

export type SendNotificationResult = {
	sent: number;
	skipped: number;
};

export type SentEmailTableViewRow = {
	id: string;
	sentAt: Date;
	toEmail: string;
	subject: string;
	body: string;
	fromEmail: string;
	type: string;
	status: SentEmailStatus;
	errorMessage: string;
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
