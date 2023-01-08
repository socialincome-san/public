import { buildCollection } from '@camberi/firecms';
import { MessageInbox, MESSAGE_INBOX_FIRESTORE_PATH } from '@socialincome/shared/src/types';



export const messageInboxCollection = buildCollection<MessageInbox>({
	name: 'Messages',
	path: MESSAGE_INBOX_FIRESTORE_PATH,
	icon: 'Textsms',
	description: 'List of messages sent to recipients',
	textSearchEnabled: false,
	permissions: ({ authController }) => ({
		edit: false,
		create: false,
		delete: false,
	}),
  properties: {
		date: {
			dataType: 'date',
			name: 'Date'
    },
    content: {
      dataType: "string",
      name: "Content",
      validation: { required: true }
    },
    from: {
      dataType: "string",
      name: "Sender",
      validation: { required: true }
    },
    to: {
      dataType: "string",
      name: "Recipient",
      validation: { required: true }
    },
    channel: {
      dataType: "string",
      name: "Channel"
    },
    status: {
      dataType: "string",
      name: "Status"
    },
    twilio_id: {
      dataType: "string",
      name: "Twilio ID"
    }    
  },
});
