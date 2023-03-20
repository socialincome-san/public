import { renderTemplate } from '../templates';

export interface SendSmsProps {
	messageRecipientPhone: string;
	messageContext: object;
	smsServiceId: string;
	smsServiceSecret: string;
	messageSenderPhone: string;
	templateParameter: {
		language: string;
		templatePath?: string;
		translationNamespace?: string;
	};
}

export interface SendSmsResponse {
	messageSid: string;
	messageStatus: string;
	messageContent: string;
}

export const sendSms = async ({
	messageRecipientPhone,
	messageContext,
	smsServiceId,
	smsServiceSecret,
	messageSenderPhone,
	templateParameter: { language, templatePath, translationNamespace },
}: SendSmsProps): Promise<SendSmsResponse> => {
	let messageStatus = 'failed';
	let messageSid = 'unknown';

	const body = await renderTemplate({
		language: language,
		translationNamespace: translationNamespace as string,
		hbsTemplatePath: templatePath as string,
		context: messageContext,
	});

	const client = require('twilio')(smsServiceId, smsServiceSecret);

	await client.messages
		.create({
			body: body,
			from: messageSenderPhone,
			to: messageRecipientPhone,
		})
		.then((message: any) => {
			console.log(message);
			messageSid = message.sid;
			messageStatus = message.status;
		});

	const sendSmsResponse: SendSmsResponse = {
		messageSid: messageSid,
		messageStatus: messageStatus,
		messageContent: body,
	};

	return sendSmsResponse;
};
