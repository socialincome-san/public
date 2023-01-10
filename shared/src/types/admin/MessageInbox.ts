export const MESSAGE_INBOX_FIRESTORE_PATH = 'message-inbox';

export type MessageInbox = {
	date: Date;
	content: string;
	from: string;
	to: string;
	channel: string;
	twilio_id: string;
	status: string;
};
