import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { renderTemplate, RenderTemplateProps } from '../templates';

export interface SendSmsProps {
	from: string;
	to: string;
	twilioConfig: {
		sid: string;
		token: string;
	};
	templateProps: RenderTemplateProps;
}

export const sendSms = async ({ to, from, twilioConfig, templateProps }: SendSmsProps): Promise<MessageInstance> => {
	const body = await renderTemplate(templateProps);
	const client = new Twilio(twilioConfig.sid, twilioConfig.token);
	return client.messages.create({ body: body, from: from, to: to });
};
