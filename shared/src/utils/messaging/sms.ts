import { renderTemplate } from "../templates";

export interface SendSmsProps {
	messageRecipientPhone: string,
	messageContext: object,
    smsServiceId: string,
    smsServiceSecret: string,
    statusCallbackUrl: URL,
    messageSenderPhone: string
	templateParameter: {
        language: string,
        templatePath?: string,
        translationNamespace?: string
    },
}

export const sendSms = async ({
	messageRecipientPhone,
	messageContext,
    smsServiceId,
    smsServiceSecret,
    statusCallbackUrl,
    messageSenderPhone,
    templateParameter: {
        language,
        templatePath,
        translationNamespace
    }
}: SendSmsProps) => {

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
			statusCallback: statusCallbackUrl,
			to: messageRecipientPhone,
		})
		.then((message: any) => {
            console.log(message);
            messageSid = message.sid;
			messageStatus = message.status;
		});
        
    return [messageSid, messageStatus];
    
};
