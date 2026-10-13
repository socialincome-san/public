import type { JsonValue } from '@/lib/audit/audit-types';
import type { AuditTableViewRow } from '@/modules/audit/audit.types';
import type { ChangeListItem } from '@socialincome/design-system/data-display/change-list/change-list';

type AuditEntityType = {
	label: string;
	/** Snapshot paths joined to the entity name; the entity id is the fallback. */
	namePaths: string[];
	/** Readable names for snapshot paths. Unknown paths show as is. */
	fieldLabels: Record<string, string>;
};

const auditEntityTypes: Record<string, AuditEntityType> = {
	recipient: {
		label: 'Recipient',
		namePaths: ['contact.firstName', 'contact.lastName'],
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
};

export const auditEntityTypeOptions = Object.entries(auditEntityTypes).map(([value, { label }]) => ({ value, label }));

export const getAuditEntityTypeLabel = ({ entityType }: AuditTableViewRow): string =>
	auditEntityTypes[entityType]?.label ?? entityType;

export const getAuditEntityName = ({ entityType, entityId, latestSnapshot }: AuditTableViewRow): string =>
	(auditEntityTypes[entityType]?.namePaths ?? [])
		.map((path) => readPath(latestSnapshot, path))
		.filter((part): part is string => typeof part === 'string' && part !== '')
		.join(' ') || entityId;

/** Self-updates from the app store no actor name; they are made by the entity itself. */
export const getAuditActorName = (row: AuditTableViewRow): string =>
	row.actorName ?? (row.actorType === row.entityType ? getAuditEntityName(row) : row.actorType);

const readPath = (value: JsonValue, path: string): JsonValue =>
	path
		.split('.')
		.reduce<JsonValue>(
			(current, key) =>
				current !== null && typeof current === 'object' && !Array.isArray(current) ? (current[key] ?? null) : null,
			value,
		);

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
