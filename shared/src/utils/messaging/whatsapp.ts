import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { renderTemplate, RenderTemplateProps } from '../templates';

export interface SendWhatsappProps {
	from: string;
	to: string;
	twilioConfig: {
		sid: string;
		token: string;
	};
	templateProps: RenderTemplateProps;
}

export const sendWhatsapp = async (
	{ to, from, twilioConfig, templateProps }: SendWhatsappProps,
): Promise<MessageInstance> => {
	const client = new Twilio(twilioConfig.sid, twilioConfig.token);
	const body = await renderTemplate(templateProps);
	return client.messages.create({ body: body, from: `whatsapp:${from}`, to: `whatsapp:${to}` });
};
