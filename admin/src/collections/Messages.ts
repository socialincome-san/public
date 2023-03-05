import { buildProperties } from '@camberi/firecms';
import { MESSAGE_FIRESTORE_PATH, Message } from '../../../shared/src/types';
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
				sms: 'SMS',
				email: 'EMAIL',
			},
        },
        sent_at: {
            dataType: 'date',
			name: 'Message Date',
            mode: 'date',
        },
        content: {
            dataType: 'string',
            name: 'Content'
        },
        to: {
            dataType: 'string',
            name: 'To'
        },
        status: {
            dataType: 'string',
            name: 'Status'
        }
	}),
});
