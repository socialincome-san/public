<<<<<<< Updated upstream
import { renderTemplate } from "../templates";
=======
//import * as fs from 'fs';
import { renderTemplate } from '../templates';

>>>>>>> Stashed changes

export interface SendSmsProps {
	messageRecipientPhone: string,
	messageContext: object,
    smsServiceId: string,
    smsServiceSecret: string,
    statusCallbackUrl: URL,
    messageSenderPhone: string
<<<<<<< Updated upstream
	language: string,
	template?: string,
=======
	templateParameter: {
        language: string,
        templatePath?: string,
        translationNamespace?: string
    },
>>>>>>> Stashed changes
}

export const sendSms = async ({
	messageRecipientPhone,
	messageContext,
    smsServiceId,
    smsServiceSecret,
    statusCallbackUrl,
    messageSenderPhone,
<<<<<<< Updated upstream
	language,
	template
=======
    templateParameter: {
        language,
        templatePath,
        translationNamespace
    }
>>>>>>> Stashed changes
}: SendSmsProps) => {

	let messageStatus = 'failed';
	let messageSid = 'unknown';
<<<<<<< Updated upstream



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
=======
    
    /*
    try {
        await fs.promises.access(`./locales/${language}/${translationNamespace}`, fs.constants.F_OK)
            .catch(() => {
                throw new Error("Translation file not found")
            });
        await fs.promises.access(`./templates/${templatePath}`, fs.constants.F_OK)
            .catch(() => {
                throw new Error("Template file not found")
            });
    } catch (e) {
        console.error(e);
        return [messageSid, messageStatus];
    }
    */

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
>>>>>>> Stashed changes
			from: messageSenderPhone,
			statusCallback: statusCallbackUrl,
			to: messageRecipientPhone,
		})
		.then((message: any) => {
<<<<<<< Updated upstream
            messageSid = message.sid;
			messageStatus = message.status;
			
		});
    return [messageSid, messageStatus] as const;
=======
            console.log(message);
            messageSid = message.sid;
			messageStatus = message.status;
		});
        
    return [messageSid, messageStatus];
    
>>>>>>> Stashed changes
};
