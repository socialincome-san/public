import { renderTemplate } from "../templates";

export interface SendSmsProps {
	messageRecipientPhone: string,
	messageContext: object,
    smsServiceId: string,
    smsServiceSecret: string,
    statusCallbackUrl: URL,
    messageSenderPhone: string
	language: string,
	template?: string,
}

export const sendSms = async ({
	messageRecipientPhone,
	messageContext,
    smsServiceId,
    smsServiceSecret,
    statusCallbackUrl,
    messageSenderPhone,
	language,
	template
}: SendSmsProps) => {

	let messageStatus = 'failed';
	let messageSid = 'unknown';



	const body = await renderTemplate({
		language: language,
		namespace: 'template-email',
		context: { language: 'de', name: 'John', amount: 100, currency: 'EUR' },
	});




	//const statusCallbackUrl = new URL(CLOUD_FUNCTIONS_URL + '/sendMessagesFunction');

	const client = require('twilio')(smsServiceId, smsServiceSecret);
	await client.messages
		.create({
			body: messageContent,
			from: messageSenderPhone,
			statusCallback: statusCallbackUrl,
			to: messageRecipientPhone,
		})
		.then((message: any) => {
            messageSid = message.sid;
			messageStatus = message.status;
			
		});
    return [messageSid, messageStatus] as const;
};
