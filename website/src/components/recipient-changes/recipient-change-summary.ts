import type { JsonValue } from '@/lib/audit/audit-types';
import type { RecipientChangeTableViewRow } from '@/modules/recipients/recipient.types';

const fieldLabels: Record<string, string> = {
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
};

const formatValue = (value: JsonValue): string => {
	if (value === null || value === '') {
		return '–';
	}

	if (typeof value === 'object') {
		return JSON.stringify(value);
	}

	return typeof value === 'string' && isoDatePattern.test(value) ? dateFormat.format(new Date(value)) : String(value);
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const dateFormat = new Intl.DateTimeFormat('de-CH', { dateStyle: 'short' });

/** One line per change, e.g. "Payment phone: +23270000001 → +23270000002". */
export const summarizeRecipientChange = ({ action, changes }: RecipientChangeTableViewRow): string => {
	if (action === 'create') {
		return 'Created';
	}
	if (action === 'delete') {
		return 'Deleted';
	}
	if (changes.length === 0) {
		return 'First recorded version';
	}

	return changes
		.map((change) => `${fieldLabels[change.path] ?? change.path}: ${formatValue(change.old)} → ${formatValue(change.new)}`)
		.join('; ');
};

export const sourceLabels: Record<string, string> = {
	portal: 'Portal',
	'partner-space': 'Partner space',
	'mobile-app': 'Mobile app',
	website: 'Website',
	system: 'System',
};
