export const MESSAGE_FIRESTORE_PATH = 'messages';

export interface Message  {
    type: "sms" | "email";
	sent_at: Date;
    content: string;
    to: string;
    status: string;
};

export interface SMS extends Message {
    external_id: string;
}

export interface Email extends Message {
    subject: string;
    cc: string;
}