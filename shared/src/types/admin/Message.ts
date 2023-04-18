import { MessageDirection, MessageStatus } from 'twilio/lib/rest/api/v2010/account/message';

export const MESSAGE_FIRESTORE_PATH = 'messages';

export enum MessageType {
	SMS = 'sms',
	EMAIL = 'email',
	WHATSAPP = 'whatsapp',
}

export interface Message {
	type: MessageType;
}

export interface TwilioMessage extends Message {
	type: MessageType.SMS | MessageType.WHATSAPP;

	// Twilio MessageInstance.toJSON() fields
	body: string;
	numSegments: string;
	direction: MessageDirection;
	from: string;
	to: string;
	dateUpdated: Date;
	price: string;
	errorMessage: string;
	uri: string;
	accountSid: string;
	numMedia: string;
	status: MessageStatus;
	messagingServiceSid: string;
	sid: string;
	dateSent: Date;
	dateCreated: Date;
	errorCode: number;
	priceUnit: string;
	apiVersion: string;
	subresourceUris: Record<string, string>;
}

export interface Email extends Message {
	type: MessageType.EMAIL;
	subject: string;
	cc: string;
}
