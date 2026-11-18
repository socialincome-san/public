import type { SentEmailStatus } from '@/generated/prisma/enums';
import type { MonthlySummary } from '@/modules/monthly-summaries/monthly-summary.types';

type EmailAudience = 'contributor' | 'staff' | 'recipient' | 'partner';
type EmailCategory = 'auth' | 'transactional' | 'marketing' | 'internal';

type EmailDescription = {
	name: string;
	description: string;
	trigger: string;
	audience: EmailAudience;
	category: EmailCategory;
	languages: string[];
};

// Every email the code sends is registered here and shown in the portal
// under Admin › Emails. Staff receivers come from the named comma-separated
// environment variable.
export const notificationTypes = {
	'monthly-summary': {
		name: 'Monthly summary',
		description: 'Money in and out, new contributors, campaigns, programs and recipients, payouts per country and partner.',
		trigger: 'Vercel cron on the 1st of every month at 08:00 UTC, for the previous month.',
		audience: 'staff',
		category: 'internal',
		languages: ['en'],
		recipientsEnv: 'MONTHLY_SUMMARY_RECIPIENTS',
	},
	'campaign-created': {
		name: 'Campaign created',
		description: 'Tells staff about a new campaign so they can review and approve it in Storyblok.',
		trigger: 'Right after someone submits a campaign on the website.',
		audience: 'staff',
		category: 'internal',
		languages: ['en'],
		recipientsEnv: 'CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS',
	},
	'campaign-edited': {
		name: 'Campaign edited',
		description: 'Lists the fields a contributor changed in their campaign; the changes are live without review.',
		trigger: 'Right after a contributor saves changes to their campaign in the dashboard.',
		audience: 'staff',
		category: 'internal',
		languages: ['en'],
		recipientsEnv: 'CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS',
	},
} as const satisfies Record<string, EmailDescription & { recipientsEnv: string }>;

export type NotificationType = keyof typeof notificationTypes;

type OtherEmail = EmailDescription & {
	key: string;
	status: 'planned' | 'external';
	source: string;
	// Live status and steps are read from SendGrid for automations with these names.
	sendgridAutomations?: string[];
};

// Emails that are not sent through sendNotification yet: planned ones, and
// ones that other systems send today.
export const otherEmails: OtherEmail[] = [
	{
		key: 'welcome-series',
		name: 'Welcome series',
		description:
			'Four emails introducing Social Income to new newsletter contacts who are not marked as contributors. No Italian version.',
		trigger: 'SendGrid Automation when a contact enters the segment "Welcome Automation EN/DE/FR"; then every 4 days.',
		audience: 'contributor',
		category: 'marketing',
		languages: ['de', 'en', 'fr'],
		status: 'external',
		source: 'SendGrid Automation',
		sendgridAutomations: ['Welcome Series (EN)', 'Welcome Series (DE)', 'Welcome Series (FR)'],
	},
	{
		key: 'donor-welcome-series',
		name: 'Donor welcome series',
		description: 'Four emails for new contributors, starting with "Your donation is already on its way". Draft.',
		trigger: 'SendGrid Automation, entry segment limited to one test address.',
		audience: 'contributor',
		category: 'marketing',
		languages: ['en'],
		status: 'planned',
		source: 'SendGrid Automation (draft)',
		sendgridAutomations: ['Donor Welcome Series'],
	},
	{
		key: 'newsletter',
		name: 'Monthly newsletter',
		description: 'Monthly update to everyone on the newsletter list, built by hand.',
		trigger: 'A person sends it as a SendGrid Single Send at the start of the month.',
		audience: 'contributor',
		category: 'marketing',
		languages: ['en'],
		status: 'external',
		source: 'SendGrid Single Send',
	},
	{
		key: 'magic-login-link',
		name: 'Login link',
		description: 'Sign-in link for the dashboard, portal and partner space, with Firebase default copy.',
		trigger: 'Someone requests a login link on the login page.',
		audience: 'contributor',
		category: 'auth',
		languages: ['en'],
		status: 'external',
		source: 'Firebase Auth',
	},
	{
		key: 'stripe-receipts',
		name: 'Stripe receipts and payment emails',
		description: 'Payment receipts, failed payments and expiring cards, if enabled in the Stripe dashboard.',
		trigger: 'Card payments and subscription events in Stripe.',
		audience: 'contributor',
		category: 'transactional',
		languages: ['en'],
		status: 'external',
		source: 'Stripe',
	},
	{
		key: 'donation-thank-you',
		name: 'Thank you for your donation',
		description: 'Confirms a donation with amount, campaign and what happens next.',
		trigger: 'Successful card payment or imported bank transfer.',
		audience: 'contributor',
		category: 'transactional',
		languages: ['de', 'en', 'fr', 'it'],
		status: 'planned',
		source: 'Code',
	},
	{
		key: 'subscription-payment-failed',
		name: 'Monthly donation payment failed',
		description: 'Asks the contributor to update their payment method.',
		trigger: 'A subscription charge fails in Stripe.',
		audience: 'contributor',
		category: 'transactional',
		languages: ['de', 'en', 'fr', 'it'],
		status: 'planned',
		source: 'Code',
	},
	{
		key: 'first-payout',
		name: 'First payout confirmation',
		description: 'Tells a new contributor that their money reached recipients. Switched off since the legacy functions.',
		trigger: "First confirmed payout after a contributor's first donation.",
		audience: 'contributor',
		category: 'transactional',
		languages: ['de', 'en', 'fr', 'it'],
		status: 'planned',
		source: 'Code',
	},
	{
		key: 'donation-certificate-ready',
		name: 'Donation certificate ready',
		description: 'Link to the yearly donation certificate in the dashboard.',
		trigger: "Daily cron in January for last year's certificates (PR #3346).",
		audience: 'contributor',
		category: 'transactional',
		languages: ['de', 'en', 'fr', 'it'],
		status: 'planned',
		source: 'Code',
	},
	{
		key: 'campaign-milestones',
		name: 'Campaign approved, milestone, ending soon, ended',
		description: 'Keeps campaign creators informed about their campaign.',
		trigger: 'Approval in Storyblok, contributions crossing 50 % and the goal, a daily cron before and after the end date.',
		audience: 'contributor',
		category: 'transactional',
		languages: ['de', 'en', 'fr', 'it'],
		status: 'planned',
		source: 'Code',
	},
];

export type CampaignCreatedEmailData = {
	id: string;
	slug: string;
	title: string;
	storyId: number;
	creatorName: string;
	goal: number | null;
	currency: string;
	endDate: Date;
	public: boolean;
	hasAccount: boolean;
};

export type CampaignEditedEmailData = {
	id: string;
	slug: string;
	title: string;
	storyId: number;
	editorName: string;
	changedFields: string[];
	hadUnpublishedChanges: boolean;
};

type NotificationDataByType = {
	'monthly-summary': MonthlySummary;
	'campaign-created': CampaignCreatedEmailData;
	'campaign-edited': CampaignEditedEmailData;
};

export type NotificationContent = {
	[Type in NotificationType]: { type: Type; data: NotificationDataByType[Type] };
}[NotificationType];

export type SendNotificationInput = NotificationContent & {
	// Scoped per receiver, so a retry only sends to those who did not get it yet.
	idempotencyKey?: string;
	campaignId?: string;
};

export type RenderedEmail = {
	subject: string;
	// Stored as the sent email body; SendGrid renders the template instead when one is given.
	text: string;
	template?: { id: string; data: Record<string, unknown> };
};

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

export type EmailCatalogEntry = EmailDescription & {
	key: string;
	status: 'live' | 'planned' | 'external';
	source: string;
	sentCount: number;
	problemCount30Days: number;
	lastSentAt: Date | null;
};

export type EmailPreview = {
	from: string;
	to: string;
	subject: string;
	body: string;
	sendgridTemplateId: string | null;
};

export type EmailAutomationView = {
	name: string;
	status: string;
	steps: { delay: string; subject: string }[];
};

export type EmailCatalogDetail = EmailCatalogEntry & {
	receivers: string[];
	preview: EmailPreview | null;
	previewError: string | null;
	automations: EmailAutomationView[];
	automationsError: string | null;
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
