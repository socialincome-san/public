export const MESSAGE_FIRESTORE_PATH = 'messages';

export interface Message {
	type: 'sms' | 'email';
	sent_at: Date;
	content: string;
	to: string;
	status: string;
}

export interface SMS extends Message {
	type: 'sms';
	external_id: string;
}

export interface Email extends Message {
	type: 'email';
	subject: string;
	cc: string;
}
