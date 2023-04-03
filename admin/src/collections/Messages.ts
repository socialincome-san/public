import { buildProperties } from '@camberi/firecms';
import { Message, MESSAGE_FIRESTORE_PATH } from '../../../shared/src/types';
import { buildAuditedCollection } from './shared';

export const messagesCollection = buildAuditedCollection<Message>({
	name: 'Messages',
	group: 'Messages',
	path: MESSAGE_FIRESTORE_PATH,
	icon: 'SupervisorAccountTwoTone',
	description: 'Lists all messages for one recipient or user',
	customId: true,
	properties: buildProperties<Message>({
		type: {
			dataType: 'string',
			name: 'Type',
			enumValues: {
				sms: 'sms',
				email: 'email',
			},
			readOnly: true,
		},
	}),
});
