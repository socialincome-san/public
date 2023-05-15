import { buildProperties } from 'firecms';
import { Email, MESSAGE_FIRESTORE_PATH, TwilioMessage } from '../../../shared/src/types';
import { buildAuditedCollection } from './shared';

export const messagesCollection = buildAuditedCollection<Partial<TwilioMessage | Email>>({
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
	properties: buildProperties<Partial<TwilioMessage | Email>>({
		type: {
			dataType: 'string',
			readOnly: true,
			enumValues: [
				{ id: 'sms', label: 'SMS' },
				{ id: 'email', label: 'Email' },
				{ id: 'whatsapp', label: 'Whatsapp' },
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
