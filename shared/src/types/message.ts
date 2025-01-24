export const MESSAGE_FIRESTORE_PATH = 'messages';

export enum MessageType {
	SMS = 'sms',
	EMAIL = 'email',
	WHATSAPP = 'whatsapp',
}

export interface Message {
	type: MessageType;
}

export interface Email extends Message {
	type: MessageType.EMAIL;
	subject: string;
	cc: string;
}
