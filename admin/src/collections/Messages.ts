import { buildProperties } from 'firecms';
import { Email, MESSAGE_FIRESTORE_PATH, SMS } from '../../../shared/src/types';
import { buildAuditedCollection } from './shared';

export const messagesCollection = buildAuditedCollection<Partial<SMS | Email>>({
	name: 'Messages',
	group: 'Messages',
	permissions: {
		create: false,
		delete: false,
		edit: false,
	},
	path: MESSAGE_FIRESTORE_PATH,
	icon: 'SupervisorAccountTwoTone',
	description: 'Lists all messages for one recipient or user',
	customId: true,
	properties: buildProperties<Partial<SMS | Email>>({
		type: {
			dataType: 'string',
			readOnly: true,
			enumValues: [
				{ id: 'sms', label: 'SMS' },
				{ id: 'email', label: 'Email' },
			],
		},
		body: {
			dataType: 'string',
			readOnly: true,
		},
		status: {
			dataType: 'string',
			readOnly: true,
		},
	}),
});
