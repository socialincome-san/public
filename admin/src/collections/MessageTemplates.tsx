import { buildCollection, buildProperties, buildProperty} from '@camberi/firecms';
import { MessageTemplate, MESSAGE_TEMPLATES_FIRESTORE_PATH } from '@socialincome/shared/src/types';



export const messageTemplatesCollection = buildCollection<MessageTemplate>({
	name: 'Message Templates',
	group: 'Finances',
	path: MESSAGE_TEMPLATES_FIRESTORE_PATH,
	alias: 'message-templates', // TODO what is this for? seems to just duplicate the value from the above line but be specified in 2 different files...
	icon: 'Textsms',
	description: 'List of message templates for sending messages to recipients',
	textSearchEnabled: false,
	permissions: ({ authController }) => ({
		edit: true,
		create: true,
		delete: true,
	}),
  properties: {
    title: {
      dataType: "string",
      name: "Title",
      validation: { required: true }
    },
    target_audience: {
      dataType: "string",
      name: "Target Audience",
      enumValues: {
        users: "Contributors",
        recipients: "Recipients"
      },
      validation: { required: true }
      
    },
    translation_default_en: {
      dataType: "string",
      name: "Message Text (english)",
      multiline: true,
      validation: { required: true }

    },
    translations: ({ values }) => {
      const properties = buildProperties<any>({
        translation_title: {
          dataType: "string",
          readOnly: true,
          markdown: true,
          defaultValue: "##### Other Translations:"
        }
     });

      if (values.target_audience) {
        if ((values.target_audience as any) === "users") {
            properties["de"] = buildProperty({
                dataType: "string",
                name: "Translation German",
                multiline: true

            });
            properties["fr"] = buildProperty({
              dataType: "string",
              name: "Translation French",
              multiline: true

          });
          properties["it"] = buildProperty({
            dataType: "string",
            name: "Translation Italian",
            multiline: true

        });
        } else if ((values.target_audience as any) === "recipients") {
            properties["krio"] = buildProperty({
                dataType: "string",
                name: "Translation Krio",
                multiline: true
            });
        }
      }

      return ({
        dataType: "map",
        title: "Source",
        properties: properties
    });
    }
  },
});
