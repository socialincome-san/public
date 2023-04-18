import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

export interface SendWhatsappProps {
	from: string;
	to: string;
	twilioConfig: {
		sid: string;
		token: string;
	};
	body: string;
}

export const sendWhatsapp = async ({ to, from, twilioConfig, body }: SendWhatsappProps): Promise<MessageInstance> => {
    from = 'whatsapp:' + from;
    to = 'whatsapp:' + to;
    console.log(to);
	const client = new Twilio(twilioConfig.sid, twilioConfig.token);
	return client.messages.create({ body: body, from: from, to: to });
};
