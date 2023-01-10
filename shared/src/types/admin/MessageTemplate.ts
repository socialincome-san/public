export const MESSAGE_TEMPLATES_FIRESTORE_PATH = 'message-templates';

export type MessageTemplate = {
	title: string;
	target_audience: string;
	translation_default_en: string;
	translations:
		| {
				title: string;
				krio: string;
		  }
		| {
				title: string;
				de: string;
				fr: string;
				it: string;
		  };
};
