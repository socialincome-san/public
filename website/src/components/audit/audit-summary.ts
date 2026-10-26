import type { JsonValue } from '@/lib/audit/audit-types';
import type { AuditTableViewRow } from '@/modules/audit/audit.types';
import type { ChangeListItem } from '@socialincome/design-system/data-display/change-list/change-list';

type AuditEntityType = {
	label: string;
	/** Readable names for snapshot paths. Unknown paths show as is. */
	fieldLabels: Record<string, string>;
};

const auditEntityTypes: Record<string, AuditEntityType> = {
	recipient: {
		label: 'Recipient',
		fieldLabels: {
			programId: 'Program',
			localPartnerId: 'Local partner',
			startDate: 'Start date',
			suspendedAt: 'Suspended at',
			suspensionReason: 'Suspension reason',
			successorName: 'Successor',
			termsAccepted: 'Terms accepted',
			'contact.firstName': 'First name',
			'contact.lastName': 'Last name',
			'contact.callingName': 'Calling name',
			'contact.email': 'Email',
			'contact.gender': 'Gender',
			'contact.language': 'Language',
			'contact.dateOfBirth': 'Date of birth',
			'contact.profession': 'Profession',
			'contact.phone.number': 'Phone',
			'contact.phone.hasWhatsApp': 'WhatsApp',
			'contact.address.street': 'Street',
			'contact.address.number': 'House number',
			'contact.address.city': 'City',
			'contact.address.zip': 'ZIP',
			'contact.address.country': 'Country',
			'paymentInformation.code': 'Payment code',
			'paymentInformation.mobileMoneyProviderId': 'Mobile money provider',
			'paymentInformation.phone.number': 'Payment phone',
		},
	},
	payout: {
		label: 'Payout',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			recipientId: 'Recipient',
			amount: 'Amount',
			amountChf: 'Amount (CHF)',
			currency: 'Currency',
			paymentAt: 'Payment date',
			status: 'Status',
			phoneNumber: 'Phone',
			comments: 'Comments',
		},
	},
	contributor: {
		label: 'Contributor',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			referral: 'Referral',
			needsOnboarding: 'Needs onboarding',
			paymentReferenceId: 'Payment reference',
			stripeCustomerId: 'Stripe customer',
			'account.firebaseAuthUserId': 'Firebase user',
			'contact.firstName': 'First name',
			'contact.lastName': 'Last name',
			'contact.callingName': 'Calling name',
			'contact.email': 'Email',
			'contact.gender': 'Gender',
			'contact.language': 'Language',
			'contact.dateOfBirth': 'Date of birth',
			'contact.profession': 'Profession',
			'contact.isInstitution': 'Institution',
			'contact.phone.number': 'Phone',
			'contact.phone.hasWhatsApp': 'WhatsApp',
			'contact.address.street': 'Street',
			'contact.address.number': 'House number',
			'contact.address.city': 'City',
			'contact.address.zip': 'ZIP',
			'contact.address.country': 'Country',
		},
	},
	contribution: {
		label: 'Contribution',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			amount: 'Amount',
			currency: 'Currency',
			amountChf: 'Amount (CHF)',
			feesChf: 'Fees (CHF)',
			status: 'Status',
			contributorId: 'Contributor',
			campaignId: 'Campaign',
		},
	},
	subscription: {
		label: 'Subscription',
		fieldLabels: {
			contributorId: 'Contributor',
			campaignId: 'Campaign',
			amount: 'Amount',
			currency: 'Currency',
			interval: 'Interval',
			status: 'Status',
			paymentMethod: 'Payment method',
			stripeSubscriptionId: 'Stripe subscription',
			bankStandingOrderReference: 'Standing order reference',
			canceledAt: 'Canceled at',
			cancellationReason: 'Cancellation reason',
			coverTransactionCosts: 'Covers transaction costs',
		},
	},
	'donation-certificate': {
		label: 'Donation certificate',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			contributorId: 'Contributor',
			year: 'Year',
			language: 'Language',
			storagePath: 'File',
		},
	},
	'local-partner': {
		label: 'Local partner',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			name: 'Name',
			slug: 'Slug',
			focuses: 'Focuses',
			'account.firebaseAuthUserId': 'Firebase user',
			'contact.firstName': 'First name',
			'contact.lastName': 'Last name',
			'contact.callingName': 'Calling name',
			'contact.email': 'Email',
			'contact.gender': 'Gender',
			'contact.language': 'Language',
			'contact.dateOfBirth': 'Date of birth',
			'contact.profession': 'Profession',
			'contact.isInstitution': 'Institution',
			'contact.phone.number': 'Phone',
			'contact.phone.hasWhatsApp': 'WhatsApp',
			'contact.address.street': 'Street',
			'contact.address.number': 'House number',
			'contact.address.city': 'City',
			'contact.address.zip': 'ZIP',
			'contact.address.country': 'Country',
		},
	},
	campaign: {
		label: 'Campaign',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			goal: 'Goal',
			currency: 'Currency',
			additionalAmountChf: 'Additional amount (CHF)',
			endDate: 'End date',
			isDefault: 'Default campaign',
			isFallback: 'Fallback campaign',
			slug: 'Slug',
			programId: 'Program',
			contributorId: 'Contributor',
			campaignPendings: 'Pending claims',
		},
	},
	survey: {
		label: 'Survey',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			name: 'Name',
			questionnaire: 'Questionnaire',
			language: 'Language',
			dueAt: 'Due at',
			completedAt: 'Completed at',
			status: 'Status',
			data: 'Answers',
			accessEmail: 'Access email',
			recipientId: 'Recipient',
			surveyScheduleId: 'Survey schedule',
		},
	},
	expense: {
		label: 'Expense',
		fieldLabels: {
			legacyFirestoreId: 'Legacy ID',
			organizationId: 'Organization',
			type: 'Type',
			year: 'Year',
			amountChf: 'Amount (CHF)',
		},
	},
	country: {
		label: 'Country',
		fieldLabels: {
			isoCode: 'ISO code',
			isActive: 'Active',
			currency: 'Currency',
			defaultPayoutAmount: 'Default payout amount',
			cashConditionOverride: 'Cash condition override',
			microfinanceIndex: 'Microfinance index',
			latestSurveyDate: 'Latest survey date',
			'microfinanceSourceLink.href': 'Microfinance source link',
			'microfinanceSourceLink.text': 'Microfinance source text',
			mobileMoneyConditionOverride: 'Mobile money condition override',
			mobileMoneyProviders: 'Mobile money providers',
			populationCoverage: 'Population coverage',
			networkTechnology: 'Network technology',
			'networkSourceLink.href': 'Network source link',
			'networkSourceLink.text': 'Network source text',
			sanctions: 'Sanctions',
		},
	},
	focus: {
		label: 'Focus',
		fieldLabels: {
			name: 'Name',
			slug: 'Slug',
		},
	},
	'mobile-money-provider': {
		label: 'Mobile money provider',
		fieldLabels: {
			name: 'Name',
			payoutProcess: 'Payout process',
			parentId: 'Parent provider',
		},
	},
	program: {
		label: 'Program',
		fieldLabels: {
			name: 'Name',
			slug: 'Slug',
			amountOfRecipientsForStart: 'Recipients at start',
			coveredByReserves: 'Covered by reserves',
			isConcluded: 'Concluded',
			programDurationInMonths: 'Duration (months)',
			payoutPerInterval: 'Payout per interval',
			payoutInterval: 'Payout interval',
			targetProfiles: 'Target profiles',
			countryId: 'Country',
			targetFocuses: 'Target focuses',
			programAccesses: 'Organization accesses',
			surveySchedules: 'Survey schedules',
		},
	},
	organization: {
		label: 'Organization',
		fieldLabels: {
			name: 'Name',
			operatorFallbackCountryCode: 'Operator fallback country',
		},
	},
	user: {
		label: 'User',
		fieldLabels: {
			role: 'Role',
			activeOrganizationId: 'Active organization',
			'account.firebaseAuthUserId': 'Firebase user',
			organizationAccesses: 'Organizations',
			'contact.firstName': 'First name',
			'contact.lastName': 'Last name',
			'contact.callingName': 'Calling name',
			'contact.email': 'Email',
			'contact.gender': 'Gender',
			'contact.language': 'Language',
			'contact.dateOfBirth': 'Date of birth',
			'contact.profession': 'Profession',
			'contact.isInstitution': 'Institution',
			'contact.phone.number': 'Phone',
			'contact.phone.hasWhatsApp': 'WhatsApp',
			'contact.address.street': 'Street',
			'contact.address.number': 'House number',
			'contact.address.city': 'City',
			'contact.address.zip': 'ZIP',
			'contact.address.country': 'Country',
		},
	},
};

export const auditEntityTypeOptions = Object.entries(auditEntityTypes).map(([value, { label }]) => ({ value, label }));

export const getAuditEntityTypeLabel = ({ entityType }: AuditTableViewRow): string =>
	auditEntityTypes[entityType]?.label ?? entityType;

export const getAuditEntityName = ({ entityId, entityName }: AuditTableViewRow): string => entityName ?? entityId;

/** Self-updates from the app store no actor name; they are made by the entity itself. */
export const getAuditActorName = (row: AuditTableViewRow): string =>
	row.actorName ?? (row.actorType === row.entityType ? getAuditEntityName(row) : row.actorType);

const formatValue = (value: JsonValue): string | null => {
	if (value === null || value === '') {
		return null;
	}
	if (typeof value === 'object') {
		return JSON.stringify(value);
	}

	return typeof value === 'string' && isoDatePattern.test(value) ? dateFormat.format(new Date(value)) : String(value);
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const dateFormat = new Intl.DateTimeFormat('de-CH', { dateStyle: 'short' });

/** Field changes for ChangeList; empty for rows that are described by text instead. */
export const getAuditChangeItems = ({ entityType, action, changes }: AuditTableViewRow): ChangeListItem[] =>
	action === 'update'
		? changes.map((change) => ({
				label: auditEntityTypes[entityType]?.fieldLabels[change.path] ?? change.path,
				previous: formatValue(change.old),
				next: formatValue(change.new),
			}))
		: [];

/** Text for rows without a field diff. */
export const describeAuditEvent = ({ action, changes }: AuditTableViewRow): string | null => {
	if (action === 'create') {
		return 'Created';
	}
	if (action === 'delete') {
		return 'Deleted';
	}

	return changes.length === 0 ? 'First recorded state' : null;
};

export const sourceLabels: Record<string, string> = {
	portal: 'Portal',
	'partner-space': 'Partner space',
	'mobile-app': 'Mobile app',
	website: 'Website',
	system: 'System',
};
