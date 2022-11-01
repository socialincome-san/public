export const MESSAGE_TEMPLATES_FIRESTORE_PATH = 'message-templates';

export type MessageTemplate = {
	text_en: string;
  text_de: string;
  text_krio: string;
  title: string;
  channel: string;
  status: string;
  recipient: number;
};
