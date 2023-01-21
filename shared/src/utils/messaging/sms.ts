export interface SendSmsProps {
	messageRecipientPhone: string,
	messageContent: string,
    smsServiceId: string,
    smsServiceSecret: string,
    statusCallbackUrl: string,
    messageSenderPhone: string
}

export const sendSms = async ({
	messageRecipientPhone,
	messageContent,
    smsServiceId,
    smsServiceSecret,
    statusCallbackUrl,
    messageSenderPhone
}: SendSmsProps) => {

	let messageStatus = 'failed';
	let messageSid = 'unknown';

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
