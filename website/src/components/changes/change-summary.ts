import type { JsonValue } from '@/lib/audit/audit-types';
import type { ChangeTableViewRow } from '@/modules/changes/change.types';
import type { ChangeListItem } from '@socialincome/design-system/data-display/change-list/change-list';

// Readable names for snapshot paths, per entity type. Unknown paths show as is.
const fieldLabels: Record<string, Record<string, string>> = {
	recipient: {
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
};

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
export const getChangeItems = ({ entityType, action, changes }: ChangeTableViewRow): ChangeListItem[] =>
	action === 'update'
		? changes.map((change) => ({
				label: fieldLabels[entityType]?.[change.path] ?? change.path,
				previous: formatValue(change.old),
				next: formatValue(change.new),
			}))
		: [];

/** Text for rows without a field diff. */
export const describeChange = ({ action, changes }: ChangeTableViewRow): string | null => {
	if (action === 'create') {
		return 'Created';
	}
	if (action === 'delete') {
		return 'Deleted';
	}

	return changes.length === 0 ? 'First recorded version' : null;
};

export const sourceLabels: Record<string, string> = {
	portal: 'Portal',
	'partner-space': 'Partner space',
	'mobile-app': 'Mobile app',
	website: 'Website',
	system: 'System',
};
