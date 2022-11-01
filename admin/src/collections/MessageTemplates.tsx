import { buildCollection, buildProperties } from '@camberi/firecms';
import { MessageTemplate, MESSAGE_TEMPLATES_FIRESTORE_PATH } from '@socialincome/shared/types';
import SendMessages from "./SendMessages"

export const messageTemplatesCollection = buildCollection<MessageTemplate>({
	name: 'Message Templates',
	group: 'Finances',
	path: MESSAGE_TEMPLATES_FIRESTORE_PATH,
	alias: 'message-templates', // TODO what is this for? seems to just duplicate the value from the above line but be specified in 2 different files...
	icon: 'Textsms',
	description: 'List of message templates for sending messages to recipients',
	textSearchEnabled: false,
  extraActions: ({path, collection, selectionController, context}) => (
    <SendMessages
      path={path}
      collection={collection}
      selectionController={selectionController}
      context={context} 
    />
  ),
	permissions: ({ authController }) => ({
		edit: false,
		create: false,
		delete: false,
	}),
  properties: buildProperties<MessageTemplate>({
    title: {
      dataType: "string",
      name: "Title",
      validation: { required: true },
    },
    channel: {
      dataType: "string",
      name: "Channel",
      enumValues: {
        sms: "SMS",
        whatsapp: "WhatsApp",
        voicecall: "Voice Call",
      },
      validation: { required: true },
    },
    text_en: {
      dataType: "string",
      name: "EN",
      validation: { required: true },
    },
    text_de: {
      dataType: "string",
      name: "DE",
    },
    text_krio: {
      dataType: "string",
      name: "KRIO",
    },
    recipient: {
      dataType: "number",
      name: "Recipient",
    },
    status: {
      dataType: "string",
      name: "Status",
      enumValues: {
        ready: "Ready",
        trigger: "Trigger",
        pending: "Pending",
        sent: "Sent ",
      },
    },
  }),
});
